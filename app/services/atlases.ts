import pg from "pg";
import { ValidationError } from "yup";
import {
  InvalidOperationError,
  NotFoundError,
} from "../../app/utils/api-handler";
import { getCrossrefPublicationInfo } from "../../app/utils/crossref/crossref";
import {
  ATLAS_STATUS,
  DoiPublicationInfo,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBAtlasOverview,
  HCAAtlasTrackerDBAtlasWithComponentAtlases,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  AtlasEditData,
  NewAtlasData,
} from "../apis/catalog/hca-atlas-tracker/common/schema";
import { query } from "./database";
import { confirmSourceDatasetStudyIsOnAtlas } from "./source-datasets";

interface AtlasInputDbData {
  overviewData: Omit<
    HCAAtlasTrackerDBAtlasOverview,
    "completedTaskCount" | "taskCount"
  >;
  targetCompletion: HCAAtlasTrackerDBAtlas["target_completion"];
}

export async function getAllAtlases(
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBAtlasWithComponentAtlases[]> {
  const queryResult = await query<HCAAtlasTrackerDBAtlasWithComponentAtlases>(
    "SELECT a.*, COUNT(c.*)::int AS component_atlas_count FROM hat.atlases a LEFT JOIN hat.component_atlases c ON c.atlas_id=a.id GROUP BY a.id",
    undefined,
    client
  );
  return queryResult.rows;
}

export async function getAtlas(
  id: string
): Promise<HCAAtlasTrackerDBAtlasWithComponentAtlases> {
  const queryResult = await query<HCAAtlasTrackerDBAtlasWithComponentAtlases>(
    "SELECT a.*, COUNT(c.*)::int AS component_atlas_count FROM hat.atlases a LEFT JOIN hat.component_atlases c ON c.atlas_id=a.id WHERE a.id=$1 GROUP BY a.id",
    [id]
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(`Atlas with ID ${id} doesn't exist`);
  return queryResult.rows[0];
}

export async function createAtlas(
  inputData: NewAtlasData
): Promise<HCAAtlasTrackerDBAtlasWithComponentAtlases> {
  const { overviewData, targetCompletion } = await atlasInputDataToDbData(
    inputData
  );
  const overview: HCAAtlasTrackerDBAtlasOverview = {
    ...overviewData,
    completedTaskCount: 0,
    taskCount: 0,
  };
  const queryResult = await query<Pick<HCAAtlasTrackerDBAtlas, "id">>(
    "INSERT INTO hat.atlases (overview, source_studies, status, target_completion) VALUES ($1, $2, $3, $4) RETURNING id",
    [JSON.stringify(overview), "[]", ATLAS_STATUS.DRAFT, targetCompletion]
  );
  const newId = queryResult.rows[0].id;
  return await getAtlas(newId);
}

export async function updateAtlas(
  id: string,
  inputData: AtlasEditData
): Promise<HCAAtlasTrackerDBAtlasWithComponentAtlases> {
  const { overviewData, targetCompletion } = await atlasInputDataToDbData(
    inputData
  );
  const queryResult = await query<HCAAtlasTrackerDBAtlas>(
    "UPDATE hat.atlases SET overview=overview||$1, target_completion=$2 WHERE id=$3 RETURNING *",
    [JSON.stringify(overviewData), targetCompletion, id]
  );
  if (queryResult.rowCount === 0)
    throw new NotFoundError(`Atlas with ID ${id} doesn't exist`);
  return await getAtlas(id);
}

export async function atlasInputDataToDbData(
  inputData: NewAtlasData | AtlasEditData
): Promise<AtlasInputDbData> {
  const publications: DoiPublicationInfo[] = [];
  if (inputData.dois)
    try {
      for (const doi of inputData.dois) {
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
  return {
    overviewData: {
      cellxgeneAtlasCollection: inputData.cellxgeneAtlasCollection ?? null,
      codeLinks: inputData.codeLinks ?? [],
      description: inputData.description ?? "",
      highlights: inputData.highlights ?? "",
      integrationLead: inputData.integrationLead,
      network: inputData.network,
      publications,
      shortName: inputData.shortName,
      version: inputData.version,
      wave: inputData.wave,
    },
    targetCompletion: inputData.targetCompletion
      ? new Date(inputData.targetCompletion)
      : null,
  };
}

export async function updateTaskCounts(): Promise<void> {
  await query(`
    UPDATE hat.atlases a
    SET
      overview = a.overview || jsonb_build_object('taskCount', counts.task_count, 'completedTaskCount', counts.completed_task_count)
    FROM (
      SELECT
        a.id AS atlas_id,
        COUNT(v.id) AS task_count,
        COUNT(CASE WHEN v.validation_info->>'validationStatus' = 'PASSED' THEN 1 END) AS completed_task_count
      FROM
        hat.atlases a
      LEFT JOIN
        hat.validations v ON a.id = ANY(v.atlas_ids)
      GROUP BY
        a.id
    ) AS counts
    WHERE a.id = counts.atlas_id;
  `);
}

/**
 * Link the given source dataset to the given atlas.
 * @param atlasId - Atlas ID.
 * @param sourceDatasetId - Source dataset ID.
 */
export async function addSourceDatasetToAtlas(
  atlasId: string,
  sourceDatasetId: string
): Promise<void> {
  await confirmSourceDatasetStudyIsOnAtlas(sourceDatasetId, atlasId);
  const alreadyLinkedQueryResult = await query(
    "SELECT EXISTS(SELECT 1 FROM hat.atlases a WHERE a.id = $1 AND $2 = ANY(a.source_datasets))",
    [atlasId, sourceDatasetId]
  );
  if (alreadyLinkedQueryResult.rows[0].exists)
    throw new InvalidOperationError(
      `Source dataset with ID ${sourceDatasetId} is already linked to atlas with ID ${atlasId}`
    );
  await query(
    "UPDATE hat.atlases SET source_datasets = source_datasets || $2::uuid WHERE id = $1",
    [atlasId, sourceDatasetId]
  );
}

/**
 * Unlink the given source dataset from the given atlas.
 * @param atlasId - Atlas ID.
 * @param sourceDatasetId - Source dataset ID.
 */
export async function removeSourceDatasetFromAtlas(
  atlasId: string,
  sourceDatasetId: string
): Promise<void> {
  const notLinkedQueryResult = await query(
    "SELECT EXISTS(SELECT 1 FROM hat.atlases a WHERE a.id = $1 AND NOT $2 = ANY(a.source_datasets))",
    [atlasId, sourceDatasetId]
  );
  if (notLinkedQueryResult.rows[0].exists)
    throw new InvalidOperationError(
      `Source dataset with ID ${sourceDatasetId} is not linked to atlas with ID ${atlasId}`
    );
  await query(
    "UPDATE hat.atlases SET source_datasets = array_remove(source_datasets, $2) WHERE id = $1",
    [atlasId, sourceDatasetId]
  );
}

/**
 * Remove the given source datasets from all atlases that have any of them.
 * @param sourceDatasetIds - IDs of source datasets to remove.
 * @param client - Postgres client to use.
 */
export async function removeSourceDatasetsFromAllAtlases(
  sourceDatasetIds: string[],
  client: pg.PoolClient
): Promise<void> {
  if (sourceDatasetIds.length === 0) return;
  await client.query(
    `
      UPDATE hat.atlases
      SET source_datasets = ARRAY(SELECT unnest(source_datasets) EXCEPT SELECT unnest($1::uuid[]))
      WHERE source_datasets && $1
    `,
    [sourceDatasetIds]
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
