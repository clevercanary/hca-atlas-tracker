import pg from "pg";
import { ValidationError } from "yup";
import { NotFoundError } from "../../app/utils/api-handler";
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
import { normalizeDoi } from "../utils/doi";
import { getSheetTitleForApi } from "../utils/google-sheets-api";
import { query } from "./database";

interface AtlasInputDbData {
  overviewData: Omit<
    HCAAtlasTrackerDBAtlasOverview,
    "completedTaskCount" | "taskCount" | "ingestionTaskCounts"
  >;
  status: HCAAtlasTrackerDBAtlas["status"];
  targetCompletion: HCAAtlasTrackerDBAtlas["target_completion"];
}

export async function getAllAtlases(
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBAtlasForAPI[]> {
  const queryResult = await query<HCAAtlasTrackerDBAtlasForAPI>(
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
    `,
    undefined,
    client
  );
  return queryResult.rows;
}

export async function getAtlas(
  id: string
): Promise<HCAAtlasTrackerDBAtlasForAPI> {
  const queryResult = await query<HCAAtlasTrackerDBAtlasForAPI>(
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
    [id]
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(`Atlas with ID ${id} doesn't exist`);
  return queryResult.rows[0];
}

export async function getBaseModelAtlas(
  id: string
): Promise<HCAAtlasTrackerDBAtlas> {
  const queryResult = await query<HCAAtlasTrackerDBAtlas>(
    "SELECT * FROM hat.atlases WHERE id=$1",
    [id]
  );

  if (queryResult.rows.length === 0)
    throw new NotFoundError(`Atlas with ID ${id} doesn't exist`);

  return queryResult.rows[0];
}

export async function createAtlas(
  inputData: NewAtlasData
): Promise<HCAAtlasTrackerDBAtlasForAPI> {
  const { overviewData, status, targetCompletion } =
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
  const queryResult = await query<Pick<HCAAtlasTrackerDBAtlas, "id">>(
    "INSERT INTO hat.atlases (overview, source_studies, status, target_completion) VALUES ($1, $2, $3, $4) RETURNING id",
    [JSON.stringify(overview), "[]", status, targetCompletion]
  );
  const newId = queryResult.rows[0].id;
  return await getAtlas(newId);
}

export async function updateAtlas(
  id: string,
  inputData: AtlasEditData
): Promise<HCAAtlasTrackerDBAtlasForAPI> {
  const { overviewData, status, targetCompletion } =
    await atlasInputDataToDbData(inputData);
  const queryResult = await query<HCAAtlasTrackerDBAtlas>(
    "UPDATE hat.atlases SET overview=overview||$1, status=$2, target_completion=$3 WHERE id=$4 RETURNING *",
    [JSON.stringify(overviewData), status, targetCompletion, id]
  );
  if (queryResult.rowCount === 0)
    throw new NotFoundError(`Atlas with ID ${id} doesn't exist`);
  return await getAtlas(id);
}

export async function atlasInputDataToDbData(
  inputData: NewAtlasData | AtlasEditData
): Promise<AtlasInputDbData> {
  const publications = await getPublicationsFromInputDois(inputData.dois);
  const metadataSpecificationTitle = await getSheetTitleForApi(
    inputData.metadataSpecificationUrl,
    "metadataSpecificationUrl"
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
      shortName: inputData.shortName,
      version: inputData.version,
      wave: inputData.wave,
    },
    status: inputData.status ?? ATLAS_STATUS.IN_PROGRESS,
    targetCompletion: inputData.targetCompletion
      ? new Date(inputData.targetCompletion)
      : null,
  };
}

async function getPublicationsFromInputDois(
  dois: string[] | undefined
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
          "dois"
        );
      }
      throw e;
    }
  }
  return publications;
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
    client
  );
}

/**
 * Throw a NotFoundError if the specified atlas doesn't exist.
 * @param atlasId - ID of the atlas to check for.
 */
export async function confirmAtlasExists(atlasId: string): Promise<void> {
  if (!(await atlasExists(atlasId)))
    throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);
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
