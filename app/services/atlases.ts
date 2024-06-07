import { NotFoundError } from "app/utils/api-handler";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBAtlasOverview,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  AtlasEditData,
  NewAtlasData,
} from "../apis/catalog/hca-atlas-tracker/common/schema";
import { query } from "./database";

interface AtlasInputDbData {
  overviewData: Omit<
    HCAAtlasTrackerDBAtlasOverview,
    "completedTaskCount" | "taskCount"
  >;
  targetCompletion: HCAAtlasTrackerDBAtlas["target_completion"];
}

export async function getAtlas(id: string): Promise<HCAAtlasTrackerDBAtlas> {
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
): Promise<HCAAtlasTrackerDBAtlas> {
  const { overviewData, targetCompletion } = await atlasInputDataToDbData(
    inputData
  );
  const overview: HCAAtlasTrackerDBAtlasOverview = {
    ...overviewData,
    completedTaskCount: 0,
    taskCount: 0,
  };
  const queryResult = await query<HCAAtlasTrackerDBAtlas>(
    "INSERT INTO hat.atlases (overview, source_studies, status, target_completion) VALUES ($1, $2, $3, $4) RETURNING *",
    [JSON.stringify(overview), "[]", ATLAS_STATUS.DRAFT, targetCompletion]
  );
  return queryResult.rows[0];
}

export async function updateAtlas(
  id: string,
  inputData: AtlasEditData
): Promise<HCAAtlasTrackerDBAtlas> {
  const { overviewData, targetCompletion } = await atlasInputDataToDbData(
    inputData
  );
  const queryResult = await query<HCAAtlasTrackerDBAtlas>(
    "UPDATE hat.atlases SET overview=overview||$1, target_completion=$2 WHERE id=$3 RETURNING *",
    [JSON.stringify(overviewData), targetCompletion, id]
  );
  if (queryResult.rowCount === 0)
    throw new NotFoundError(`Atlas with ID ${id} doesn't exist`);
  return queryResult.rows[0];
}

export async function atlasInputDataToDbData(
  inputData: NewAtlasData | AtlasEditData
): Promise<AtlasInputDbData> {
  return {
    overviewData: {
      integrationLead: inputData.integrationLead,
      network: inputData.network,
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
