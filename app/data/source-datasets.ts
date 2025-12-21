import pg from "pg";
import {
  FILE_TYPE,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetForAPI,
  HCAAtlasTrackerDBSourceDatasetForDetailAPI,
  HCAAtlasTrackerDBSourceDatasetInfo,
  PUBLICATION_STATUS,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { doTransaction, query } from "../services/database";
import { confirmSourceStudyExists } from "../services/source-studies";
import { NotFoundError } from "../utils/api-handler";
import { confirmQueryRowsContainIds } from "../utils/database";
import { confirmFileIsOfType } from "./files";

const PLURAL_ENTITY_NAME = "source datasets";

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
 * @param isArchivedValues - Values of `is_archived` to filter source datasets by. (Default `[false]`)
 * @param client - Postgres client to use.
 * @returns source datasets with fields for APIs.
 */
export async function getSourceDatasetsForApi(
  sourceDatasetIds: string[],
  acceptSubset = false,
  isArchivedValues = [false],
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI[]> {
  const { rows: sourceDatasets } =
    await query<HCAAtlasTrackerDBSourceDatasetForAPI>(
      `
        SELECT
          d.*,
          f.event_info,
          f.id as file_id,
          f.is_archived,
          f.key,
          f.size_bytes,
          f.dataset_info,
          f.validation_status,
          f.validation_summary,
          s.doi,
          s.study_info
        FROM hat.source_datasets d
        JOIN hat.files f ON f.id = d.file_id
        LEFT JOIN hat.source_studies s ON d.source_study_id = s.id
        WHERE d.id = ANY($1) AND f.is_latest AND f.is_archived = ANY($2)
      `,
      [sourceDatasetIds, isArchivedValues],
      client
    );

  if (!acceptSubset)
    confirmQueryRowsContainIds(
      sourceDatasets,
      sourceDatasetIds,
      PLURAL_ENTITY_NAME
    );

  return sourceDatasets;
}

/**
 * Get specified source dataset joined with data used for detail API responses.
 * @param sourceDatasetId - ID of source dataset to get.
 * @param client - Postgres client to use.
 * @returns source dataset with fields for detail API.
 */
export async function getSourceDatasetForDetailApi(
  sourceDatasetId: string,
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBSourceDatasetForDetailAPI> {
  const queryResult = await query<HCAAtlasTrackerDBSourceDatasetForDetailAPI>(
    `
      SELECT
        d.*,
        f.event_info,
        f.id as file_id,
        f.is_archived,
        f.key,
        f.size_bytes,
        f.dataset_info,
        f.validation_status,
        f.validation_summary,
        f.validation_reports,
        s.doi,
        s.study_info
      FROM hat.source_datasets d
      JOIN hat.files f ON f.id = d.file_id
      LEFT JOIN hat.source_studies s ON d.source_study_id = s.id
      WHERE d.id = $1 AND f.is_latest
    `,
    [sourceDatasetId],
    client
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(
      `Source dataset with ID ${sourceDatasetId} does not exist`
    );
  return queryResult.rows[0];
}

/**
 * Set the publication status of each of the given source datasets.
 * @param sourceDatasetIds - IDs of source datasets to set publication status of.
 * @param publicationStatus - Publication status to set.
 */
export async function setSourceDatasetsPublicationStatus(
  sourceDatasetIds: string[],
  publicationStatus: PUBLICATION_STATUS
): Promise<void> {
  const sdInfoUpdate: Pick<
    HCAAtlasTrackerDBSourceDatasetInfo,
    "publicationStatus"
  > = {
    publicationStatus,
  };

  await doTransaction(async () => {
    const { rows } = await query<Pick<HCAAtlasTrackerDBSourceDataset, "id">>(
      "UPDATE hat.source_datasets SET sd_info = sd_info || $1 WHERE id = ANY($2) RETURNING id",
      [JSON.stringify(sdInfoUpdate), sourceDatasetIds]
    );
    confirmQueryRowsContainIds(rows, sourceDatasetIds, PLURAL_ENTITY_NAME);
  });
}

/**
 * Set the linked source study ID of each of the given source datasets.
 * @param sourceDatasetIds - IDs of source datasets to set source study of.
 * @param sourceStudyId - ID or null to set source study ID to.
 */
export async function setSourceDatasetsSourceStudy(
  sourceDatasetIds: string[],
  sourceStudyId: string | null
): Promise<void> {
  await doTransaction(async (client) => {
    const queryResult = await client.query<
      Pick<HCAAtlasTrackerDBSourceDataset, "id">
    >(
      "UPDATE hat.source_datasets SET source_study_id = $1 WHERE id = ANY($2) RETURNING id",
      [sourceStudyId, sourceDatasetIds]
    );

    const presentIds = new Set(queryResult.rows.map(({ id }) => id));
    const missingIds = sourceDatasetIds.filter((id) => !presentIds.has(id));

    if (missingIds.length !== 0)
      throw new NotFoundError(
        `No source datasets exist with ID(s): ${missingIds.join(", ")}`
      );
  });
}

/**
 * Set the associated file ID referenced by a source dataset.
 * @param sourceDatasetId - Source dataset to update.
 * @param fileId - ID to set in the source dataset, referencing its file.
 * @param client - Postgres client to use.
 */
export async function setSourceDatasetFileId(
  sourceDatasetId: string,
  fileId: string,
  client: pg.PoolClient
): Promise<void> {
  await confirmFileIsOfType(fileId, FILE_TYPE.SOURCE_DATASET, client);
  const result = await client.query(
    "UPDATE hat.source_datasets SET file_id = $1 WHERE id = $2",
    [fileId, sourceDatasetId]
  );
  if (result.rowCount === 0)
    throw new NotFoundError(
      `Source dataset with ID ${sourceDatasetId} doesn't exist`
    );
}

/**
 * Unlink all source datasets from the given source study.
 * @param sourceStudyId - ID of the source study to unlink source datasets from.
 * @param client - Postgres client to use.
 */
export async function unlinkAllSourceDatasetsFromSourceStudy(
  sourceStudyId: string,
  client: pg.PoolClient
): Promise<void> {
  await client.query(
    "UPDATE hat.source_datasets SET source_study_id = NULL WHERE source_study_id = $1",
    [sourceStudyId]
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
      JOIN hat.files f ON f.id = d.file_id
      WHERE d.id = ANY($1) AND f.is_latest AND NOT f.is_archived
    `,
    [sourceDatasetIds]
  );
  confirmQueryRowsContainIds(
    queryResult.rows,
    sourceDatasetIds,
    PLURAL_ENTITY_NAME
  );
}

export async function confirmSourceDatasetsExistOnAtlas(
  sourceDatasetIds: string[],
  atlasId: string
): Promise<void> {
  const atlasSourceDatasetIds = await getAtlasSourceDatasetIds(atlasId);

  const missingSourceDatasetIds = sourceDatasetIds.filter(
    (id) => !atlasSourceDatasetIds.includes(id)
  );

  if (missingSourceDatasetIds.length > 0)
    throw new NotFoundError(
      `Atlas with ID ${atlasId} does not have source dataset(s): ${missingSourceDatasetIds.join(
        ", "
      )}`
    );
}
