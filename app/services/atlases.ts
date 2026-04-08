import pg from "pg";
import { ValidationError } from "yup";
import { InvalidOperationError } from "../../app/utils/api-handler";
import { getCrossrefPublicationInfo } from "../../app/utils/crossref/crossref";
import {
  ATLAS_STATUS,
  DoiPublicationInfo,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBAtlasForAPI,
  HCAAtlasTrackerDBAtlasOverview,
  SYSTEM,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  AtlasEditData,
  NewAtlasData,
} from "../apis/catalog/hca-atlas-tracker/common/schema";
import {
  getPublishedFromPublishedAt,
  isUuid,
} from "../apis/catalog/hca-atlas-tracker/common/utils";
import { normalizeDoi } from "../utils/doi";
import { getSheetTitleForApi } from "../utils/google-sheets-api";
import {
  atlasIsLatestRevision,
  changeAtlasToPublished,
  getAtlasIdBySlugNameAndVersion,
  createAtlasRevision,
  getAdvisoryLockForAtlas,
  getAtlasInfoFromIdBasedQuery,
  getAtlasNotFoundError,
  getAtlasPublishedAt,
  getAtlasSourceStudyIds,
  CONSTRAINT_ATLAS_SLUG_VERSION_UNIQUE,
} from "../data/atlases";
import { publishUnpublishedComponentAtlasesOfAtlas } from "../data/component-atlases";
import { publishUnpublishedSourceDatasetsOfAtlas } from "../data/source-datasets";
import { parseAtlasNameUrlSlug, slugifyAtlasShortName } from "../utils/atlases";
import { addAssociatedEntityToUsersAssociatedWith } from "../data/users";
import { doTransaction, mapDatabaseError, query } from "./database";
import { updateSourceStudyValidationsByEntityIds } from "./source-studies";

interface AtlasInputDbData {
  overviewData: Omit<
    HCAAtlasTrackerDBAtlasOverview,
    "completedTaskCount" | "taskCount" | "ingestionTaskCounts"
  >;
  shortNameSlug: HCAAtlasTrackerDBAtlas["short_name_slug"];
  status: HCAAtlasTrackerDBAtlas["status"];
  targetCompletion: HCAAtlasTrackerDBAtlas["target_completion"];
}

export async function getAllAtlases(
  client?: pg.PoolClient,
): Promise<HCAAtlasTrackerDBAtlasForAPI[]> {
  const queryResult = await query<HCAAtlasTrackerDBAtlasForAPI>(
    `
      WITH atlases_with_revisions AS (
        SELECT
          ar.*,
          MAX(ar.revision) OVER (
            PARTITION BY ar.overview->>'network', ar.overview->>'shortName', ar.generation
          ) AS max_revision
        FROM hat.atlases ar
      )
      SELECT
        a.*,
        a.revision = a.max_revision AS is_latest,
        (
          SELECT COUNT(c.id)::int
          FROM hat.component_atlases c
          JOIN hat.files f ON f.id = c.file_id
          WHERE c.version_id = ANY(a.component_atlases) AND NOT f.is_archived
        ) AS component_atlas_count,
        (
          SELECT COUNT(d.id)::int
          FROM hat.source_datasets d
          JOIN hat.files f ON f.id = d.file_id
          WHERE d.version_id = ANY(a.source_datasets) AND NOT f.is_archived
        ) AS source_dataset_count,
        (
          SELECT COUNT(DISTINCT e.id)::int
          FROM hat.entry_sheet_validations e
          WHERE a.source_studies ? e.source_study_id::text
        ) AS entry_sheet_validation_count
      FROM atlases_with_revisions a
    `,
    undefined,
    client,
  );
  return queryResult.rows;
}

/**
 * Get base-model representation of all published atlases.
 * @returns base-model published atlases.
 */
export async function getAllPublishedAtlases(): Promise<
  HCAAtlasTrackerDBAtlas[]
> {
  const queryResult = await query<HCAAtlasTrackerDBAtlas>(
    "SELECT * FROM hat.atlases WHERE published_at IS NOT NULL",
  );
  return queryResult.rows;
}

export async function getAtlas(
  id: string,
  client?: pg.PoolClient,
): Promise<HCAAtlasTrackerDBAtlasForAPI> {
  const queryResult = await query<
    Omit<HCAAtlasTrackerDBAtlasForAPI, "is_latest">
  >(
    `
      SELECT
        a.*,
        (
          SELECT COUNT(c.id)::int
          FROM hat.component_atlases c
          JOIN hat.files f ON f.id = c.file_id
          WHERE c.version_id = ANY(a.component_atlases) AND NOT f.is_archived
        ) AS component_atlas_count,
        (
          SELECT COUNT(d.id)::int
          FROM hat.source_datasets d
          JOIN hat.files f ON f.id = d.file_id
          WHERE d.version_id = ANY(a.source_datasets) AND NOT f.is_archived
        ) AS source_dataset_count,
        (
          SELECT COUNT(DISTINCT e.id)::int
          FROM hat.entry_sheet_validations e
          WHERE a.source_studies ? e.source_study_id::text
        ) AS entry_sheet_validation_count
      FROM hat.atlases a
      WHERE a.id=$1
    `,
    [id],
    client,
  );
  return {
    ...getAtlasInfoFromIdBasedQuery(queryResult, id),
    is_latest: await atlasIsLatestRevision(id, client),
  };
}

export async function getBaseModelAtlas(
  id: string,
  client?: pg.PoolClient,
): Promise<HCAAtlasTrackerDBAtlas> {
  const queryResult = await query<HCAAtlasTrackerDBAtlas>(
    "SELECT * FROM hat.atlases WHERE id=$1",
    [id],
    client,
  );

  return getAtlasInfoFromIdBasedQuery(queryResult, id);
}

export async function createAtlas(
  inputData: NewAtlasData,
): Promise<HCAAtlasTrackerDBAtlasForAPI> {
  const { overviewData, shortNameSlug, status, targetCompletion } =
    await atlasInputDataToDbData(inputData);
  const overview: HCAAtlasTrackerDBAtlasOverview = {
    ...overviewData,
    completedTaskCount: 0,
    ingestionTaskCounts: {
      [SYSTEM.CAP]: { completedCount: 0, count: 0 },
      [SYSTEM.CELLXGENE]: { completedCount: 0, count: 0 },
      [SYSTEM.HCA_DATA_REPOSITORY]: { completedCount: 0, count: 0 },
    },
    taskCount: 0,
  };
  const queryResult = await mapDatabaseError(
    () =>
      query<Pick<HCAAtlasTrackerDBAtlas, "id">>(
        "INSERT INTO hat.atlases (generation, revision, overview, source_studies, status, target_completion, short_name_slug) VALUES (1, 0, $1, $2, $3, $4, $5) RETURNING id",
        [
          JSON.stringify(overview),
          "[]",
          status,
          targetCompletion,
          shortNameSlug,
        ],
      ),
    () =>
      new ValidationError(
        `Atlas ${overview.shortName} v1.0 already exists`,
        undefined,
        "shortName",
      ),
    { constraint: CONSTRAINT_ATLAS_SLUG_VERSION_UNIQUE },
  );
  const newId = queryResult.rows[0].id;
  return await getAtlas(newId);
}

export async function updateAtlas(
  id: string,
  inputData: AtlasEditData,
): Promise<HCAAtlasTrackerDBAtlasForAPI> {
  const { overviewData, shortNameSlug, status, targetCompletion } =
    await atlasInputDataToDbData(inputData);
  const queryResult = await mapDatabaseError(
    () =>
      query<HCAAtlasTrackerDBAtlas>(
        "UPDATE hat.atlases SET overview=overview||$1, status=$2, target_completion=$3, short_name_slug=$4 WHERE id=$5 RETURNING *",
        [
          JSON.stringify(overviewData),
          status,
          targetCompletion,
          shortNameSlug,
          id,
        ],
      ),
    () =>
      new ValidationError(
        `Atlas ${inputData.shortName} of this version already exists`,
        undefined,
        "shortName",
      ),
    { constraint: CONSTRAINT_ATLAS_SLUG_VERSION_UNIQUE },
  );
  if (queryResult.rowCount === 0) throw getAtlasNotFoundError(id);
  return await getAtlas(id);
}

export async function atlasInputDataToDbData(
  inputData: NewAtlasData | AtlasEditData,
): Promise<AtlasInputDbData> {
  const shortName = inputData.shortName;
  const publications = await getPublicationsFromInputDois(inputData.dois);
  const metadataSpecificationTitle = await getSheetTitleForApi(
    inputData.metadataSpecificationUrl,
    "metadataSpecificationUrl",
  );
  return {
    overviewData: {
      capId: inputData.capId || null,
      cellxgeneAtlasCollection: inputData.cellxgeneAtlasCollection ?? null,
      codeLinks: inputData.codeLinks ?? [],
      description: inputData.description ?? "",
      highlights: inputData.highlights ?? "",
      integrationLead: inputData.integrationLead,
      metadataCorrectnessUrl: inputData.metadataCorrectnessUrl || null,
      metadataSpecificationTitle,
      metadataSpecificationUrl: inputData.metadataSpecificationUrl || null,
      network: inputData.network,
      publications,
      shortName,
      wave: inputData.wave,
    },
    shortNameSlug: slugifyAtlasShortName(shortName),
    status: inputData.status ?? ATLAS_STATUS.IN_PROGRESS,
    targetCompletion: inputData.targetCompletion
      ? new Date(inputData.targetCompletion)
      : null,
  };
}

async function getPublicationsFromInputDois(
  dois: string[] | undefined,
): Promise<DoiPublicationInfo[]> {
  const publications: DoiPublicationInfo[] = [];
  if (dois) {
    try {
      for (const sourceDoi of dois) {
        const doi = normalizeDoi(sourceDoi);
        publications.push({
          doi,
          publication: await getCrossrefPublicationInfo(doi),
        });
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        throw new ValidationError(
          `Crossref data doesn't fit: ${e.message}`,
          undefined,
          "dois",
        );
      }
      throw e;
    }
  }
  return publications;
}

/**
 * Publish an atlas and its linked entities.
 * @param atlasId - ID of the atlas to publish.
 * @returns updated atlas.
 */
export async function publishAtlas(
  atlasId: string,
): Promise<HCAAtlasTrackerDBAtlasForAPI> {
  return doTransaction(async (client) => {
    if (await atlasIsPublished(atlasId, client)) {
      throw new InvalidOperationError(
        `Atlas with ID ${atlasId} is already published`,
      );
    }
    const publishedAt = new Date();
    await publishUnpublishedComponentAtlasesOfAtlas(
      atlasId,
      publishedAt,
      client,
    );
    await publishUnpublishedSourceDatasetsOfAtlas(atlasId, publishedAt, client);
    await changeAtlasToPublished(atlasId, publishedAt, client);
    return getAtlas(atlasId, client);
  });
}

/**
 * Create a new revision based on a given atlas if valid, and update linked entities.
 * @param atlasId - ID of the atlas to attempt to create a new revision from.
 * @returns new atlas.
 */
export async function createAndHandleNewAtlasRevision(
  atlasId: string,
): Promise<HCAAtlasTrackerDBAtlasForAPI> {
  return doTransaction(async (client) => {
    await getAdvisoryLockForAtlas(atlasId, client);
    if (!(await atlasIsLatestRevision(atlasId, client)))
      throw new InvalidOperationError(
        `A new atlas revision may only be created from a latest-revision atlas`,
      );
    if (!(await atlasIsPublished(atlasId, client)))
      throw new InvalidOperationError(
        `The latest revision of an atlas must be published before a new revision may be created`,
      );
    const newAtlasId = await createAtlasRevision(atlasId, client);
    await addAssociatedEntityToUsersAssociatedWith(newAtlasId, atlasId, client);
    await updateAtlasSourceStudyValidations(newAtlasId, client);
    return getAtlas(newAtlasId, client);
  });
}

/**
 * Update validations for all source studies of a given atlas.
 * @param atlasId - Atlas ID.
 * @param client - Postgres client to use.
 */
async function updateAtlasSourceStudyValidations(
  atlasId: string,
  client: pg.PoolClient,
): Promise<void> {
  await updateSourceStudyValidationsByEntityIds(
    await getAtlasSourceStudyIds(atlasId, client),
    client,
  );
}

export async function updateTaskCounts(client?: pg.PoolClient): Promise<void> {
  await query(
    `
      UPDATE hat.atlases a
      SET
        overview = a.overview || jsonb_build_object(
          'taskCount', counts.task_count,
          'completedTaskCount', counts.completed_task_count,
          'ingestionTaskCounts', counts.ingestion_task_counts
        )
      FROM (
        SELECT
          a.id AS atlas_id,
          COUNT(v.*) AS task_count,
          COUNT(v.*) FILTER (WHERE v.validation_info->>'validationStatus' = 'PASSED') AS completed_task_count,
          jsonb_build_object(
            'CAP', jsonb_build_object(
              'count', COUNT(v.*) FILTER (WHERE v.validation_id = 'SOURCE_STUDY_IN_CAP'),
              'completedCount', COUNT(v.*) FILTER (WHERE v.validation_id = 'SOURCE_STUDY_IN_CAP' AND v.validation_info->>'validationStatus' = 'PASSED')
            ),
            'CELLXGENE', jsonb_build_object(
              'count', COUNT(v.*) FILTER (WHERE v.validation_id = 'SOURCE_STUDY_IN_CELLXGENE'),
              'completedCount', COUNT(v.*) FILTER (WHERE v.validation_id = 'SOURCE_STUDY_IN_CELLXGENE' AND v.validation_info->>'validationStatus' = 'PASSED')
            ),
            'HCA_DATA_REPOSITORY', jsonb_build_object(
              'count', COUNT(v.*) FILTER (WHERE v.validation_id = 'SOURCE_STUDY_IN_HCA_DATA_REPOSITORY'),
              'completedCount', COUNT(v.*) FILTER (WHERE v.validation_id = 'SOURCE_STUDY_IN_HCA_DATA_REPOSITORY' AND v.validation_info->>'validationStatus' = 'PASSED')
            )
          ) AS ingestion_task_counts
        FROM
          hat.atlases a
        LEFT JOIN
          hat.validations v ON a.id = ANY(v.atlas_ids)
        GROUP BY
          a.id
      ) AS counts
      WHERE a.id = counts.atlas_id;
    `,
    undefined,
    client,
  );
}

/**
 * Get whether a given atlas is published.
 * @param atlasId - Atlas ID.
 * @param client - Postgres client to use.
 * @returns boolean indicating whether the atlas is published.
 */
export async function atlasIsPublished(
  atlasId: string,
  client?: pg.PoolClient,
): Promise<boolean> {
  return getPublishedFromPublishedAt(
    await getAtlasPublishedAt(atlasId, client),
  );
}

/**
 * Throw a NotFoundError if the specified atlas doesn't exist.
 * @param atlasId - ID of the atlas to check for.
 */
export async function confirmAtlasExists(atlasId: string): Promise<void> {
  if (!(await atlasExists(atlasId))) throw getAtlasNotFoundError(atlasId);
}

/**
 * Determine whether the atlas with the given ID exists.
 * @param atlasId - Atlas ID to check for.
 * @returns true if the atlas exists.
 */
export async function atlasExists(atlasId: string): Promise<boolean> {
  return (
    await query("SELECT EXISTS(SELECT 1 FROM hat.atlases WHERE id=$1)", [
      atlasId,
    ])
  ).rows[0].exists;
}

/**
 * Get an atlas's ID based on an identifier given in a URL.
 * @param urlParam - URL parameter.
 * @returns atlas ID.
 */
export async function getAtlasIdByUrlParameter(
  urlParam: string,
): Promise<string> {
  // Return the parameter as-is if it appears to already be a UUID
  if (isUuid(urlParam)) return urlParam;

  // Attempt to parse the parameter as a name
  const nameInfo = parseAtlasNameUrlSlug(urlParam);
  if (nameInfo === null)
    throw new InvalidOperationError("Unknown atlas identifier format");
  return getAtlasIdBySlugNameAndVersion(nameInfo);
}
