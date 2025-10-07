import pg from "pg";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetForAPI,
  HCAAtlasTrackerDBSourceDatasetForDetailAPI,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { query } from "../services/database";
import { confirmSourceStudyExists } from "../services/source-studies";
import { NotFoundError } from "../utils/api-handler";

/**
 * Get the IDs of source datasets linked to the given atlas.
 * @param atlasId - Atlas ID.
 * @param client - Postgres client to use.
 * @returns source dataset IDs.
 */
export async function getAtlasSourceDatasetIds(
  atlasId: string,
  client?: pg.PoolClient
): Promise<string[]> {
  const atlasResult = await query<
    Pick<HCAAtlasTrackerDBAtlas, "source_datasets">
  >("SELECT source_datasets FROM hat.atlases WHERE id=$1", [atlasId], client);
  if (atlasResult.rows.length === 0)
    throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);
  return atlasResult.rows[0].source_datasets;
}

/**
 * Get the IDs of source datasets linked to the given source study.
 * @param sourceStudyId - Source study ID.
 * @returns source dataset IDs.
 */
export async function getSourceStudySourceDatasetIds(
  sourceStudyId: string
): Promise<string[]> {
  await confirmSourceStudyExists(sourceStudyId);
  const queryResult = await query<Pick<HCAAtlasTrackerDBSourceDataset, "id">>(
    "SELECT id FROM hat.source_datasets WHERE source_study_id=$1",
    [sourceStudyId]
  );
  return queryResult.rows.map((r) => r.id);
}

/**
 * Get the IDs of source datasets linked to the given component atlas.
 * @param componentAtlasId - Component atlas ID.
 * @returns source dataset IDs.
 */
export async function getComponentAtlasSourceDatasetIds(
  componentAtlasId: string
): Promise<string[]> {
  const componentAtlasResult = await query<
    Pick<HCAAtlasTrackerDBComponentAtlas, "source_datasets">
  >("SELECT source_datasets FROM hat.component_atlases WHERE id=$1", [
    componentAtlasId,
  ]);
  if (componentAtlasResult.rows.length === 0)
    throw new NotFoundError(
      `Component atlas with ID ${componentAtlasId} doesn't exist`
    );
  return componentAtlasResult.rows[0].source_datasets;
}

/**
 * Get specified source datasets joined with data used for API responses.
 * @param sourceDatasetIds - IDs of source datasets to get.
 * @param acceptSubset - If false, an error will be thrown if any of the specified source datasets are unavailable. (Default false)
 * @param isArchivedValue - Value of `is_archived` to filter source datasets by. (Default false)
 * @param client - Postgres client to use.
 * @returns source datasets with fields for APIs.
 */
export async function getSourceDatasetsForApi(
  sourceDatasetIds: string[],
  acceptSubset = false,
  isArchivedValue = false,
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI[]> {
  const { rows: sourceDatasets } =
    await query<HCAAtlasTrackerDBSourceDatasetForAPI>(
      `
        SELECT
          d.*,
          f.id as file_id,
          f.key,
          f.size_bytes,
          f.dataset_info,
          f.validation_status,
          f.validation_summary,
          s.doi,
          s.study_info
        FROM hat.source_datasets d
        JOIN hat.files f ON f.source_dataset_id = d.id
        LEFT JOIN hat.source_studies s ON d.source_study_id = s.id
        WHERE d.id = ANY($1) AND f.is_latest AND f.is_archived = $2
      `,
      [sourceDatasetIds, isArchivedValue],
      client
    );

  if (!acceptSubset)
    confirmSourceDatasetIdsArePresent(sourceDatasets, sourceDatasetIds);

  return sourceDatasets;
}

/**
 * Get specified source dataset joined with data used for detail API responses.
 * @param sourceDatasetId - ID of source dataset to get.
 * @param isArchivedValue - Value of `is_archived` to filter source datasets by. (Default false)
 * @param client - Postgres client to use.
 * @returns source dataset with fields for detail API.
 */
export async function getSourceDatasetForDetailApi(
  sourceDatasetId: string,
  isArchivedValue = false,
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBSourceDatasetForDetailAPI> {
  const queryResult = await query<HCAAtlasTrackerDBSourceDatasetForDetailAPI>(
    `
      SELECT
        d.*,
        f.id as file_id,
        f.key,
        f.size_bytes,
        f.dataset_info,
        f.validation_status,
        f.validation_summary,
        f.validation_reports,
        s.doi,
        s.study_info
      FROM hat.source_datasets d
      JOIN hat.files f ON f.source_dataset_id = d.id
      LEFT JOIN hat.source_studies s ON d.source_study_id = s.id
      WHERE d.id = $1 AND f.is_latest AND f.is_archived = $2
    `,
    [sourceDatasetId, isArchivedValue],
    client
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(
      `Source dataset with ID ${sourceDatasetId} does not exist`
    );
  return queryResult.rows[0];
}

/**
 * Throw an error if the given source dataset is not linked to the given source study.
 * @param sourceDatasetId - Source dataset ID.
 * @param sourceStudyId - Source study ID.
 * @param client - Postgres client to use.
 */
export async function confirmSourceDatasetIsLinkedToStudy(
  sourceDatasetId: string,
  sourceStudyId: string,
  client?: pg.PoolClient
): Promise<void> {
  const queryResult = await query(
    "SELECT 1 FROM hat.source_datasets WHERE id=$1 AND source_study_id=$2",
    [sourceDatasetId, sourceStudyId],
    client
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(
      `Source dataset with ID ${sourceDatasetId} is not linked to source study with ID ${sourceStudyId}`
    );
}

/**
 * Throw an error if any of the specified source datasets are not available to users (e.g., are archived).
 * @param sourceDatasetIds - IDs of source datasets to check.
 */
export async function confirmSourceDatasetsAreAvailable(
  sourceDatasetIds: string[]
): Promise<void> {
  const queryResult = await query<Pick<HCAAtlasTrackerDBSourceDataset, "id">>(
    `
      SELECT d.id
      FROM hat.source_datasets d
      JOIN hat.files f ON f.source_dataset_id = d.id
      WHERE d.id = ANY($1) AND f.is_latest AND NOT f.is_archived
    `,
    [sourceDatasetIds]
  );
  confirmSourceDatasetIdsArePresent(queryResult.rows, sourceDatasetIds);
}

/**
 * Throw an error if the given source datasets do not include all expected source dataset IDs.
 * @param sourceDatasets - Array of (partial) source datasets that were found.
 * @param expectedIds - Source dataset IDs that are expected to be present.
 */
function confirmSourceDatasetIdsArePresent(
  sourceDatasets: Pick<HCAAtlasTrackerDBSourceDataset, "id">[],
  expectedIds: string[]
): void {
  const presentIds = new Set(sourceDatasets.map((d) => d.id));
  const missingIds = expectedIds.filter((id) => !presentIds.has(id));

  if (missingIds.length)
    throw new NotFoundError(
      `No source datasets exist with ID(s): ${missingIds.join(", ")}`
    );
}
