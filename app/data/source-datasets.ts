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
import { confirmAtlasExists } from "../services/atlases";
import { doTransaction, query } from "../services/database";
import { confirmSourceStudyExists } from "../services/source-studies";
import { NotFoundError } from "../utils/api-handler";
import { confirmQueryRowsContainVersionIds } from "../utils/database";
import { confirmFileIsOfType } from "./files";

const PLURAL_ENTITY_NAME = "source datasets";

/**
 * Get the version IDs of source datasets linked to the given atlas.
 * @param atlasId - Atlas ID.
 * @param client - Postgres client to use.
 * @returns source dataset version IDs.
 */
export async function getAtlasSourceDatasetVersionIds(
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
 * Get the version IDs of source datasets linked to the given source study on the given atlas.
 * @param sourceStudyId - Source study ID.
 * @param atlasId - Atlas to limit source dataset versions by.
 * @returns source dataset version IDs.
 */
export async function getSourceStudySourceDatasetVersionIds(
  sourceStudyId: string,
  atlasId: string
): Promise<string[]> {
  await confirmSourceStudyExists(sourceStudyId);
  await confirmAtlasExists(atlasId);
  const queryResult = await query<
    Pick<HCAAtlasTrackerDBSourceDataset, "version_id">
  >(
    `
      SELECT d.version_id
      FROM hat.source_datasets d
      JOIN hat.atlases a ON d.version_id=ANY(a.source_datasets)
      WHERE d.source_study_id=$1 AND a.id=$1
    `,
    [sourceStudyId]
  );
  return queryResult.rows.map((r) => r.version_id);
}

/**
 * Get the version IDs of source datasets linked to the given component atlas.
 * @param componentAtlasVersion - Component atlas version ID.
 * @returns source dataset version IDs.
 */
export async function getComponentAtlasSourceDatasetVersionIds(
  componentAtlasVersion: string
): Promise<string[]> {
  const componentAtlasResult = await query<
    Pick<HCAAtlasTrackerDBComponentAtlas, "source_datasets">
  >("SELECT source_datasets FROM hat.component_atlases WHERE version_id=$1", [
    componentAtlasVersion,
  ]);
  if (componentAtlasResult.rows.length === 0)
    throw new NotFoundError(
      `Component atlas with version ID ${componentAtlasVersion} doesn't exist`
    );
  return componentAtlasResult.rows[0].source_datasets;
}

/**
 * Get specified source datasets joined with data used for API responses.
 * @param sourceDatasetVersions - Version IDs of source datasets to get.
 * @param acceptSubset - If false, an error will be thrown if any of the specified source datasets are unavailable. (Default false)
 * @param isArchivedValues - Values of `is_archived` to filter source datasets by. (Default `[false]`)
 * @param client - Postgres client to use.
 * @returns source datasets with fields for APIs.
 */
export async function getSourceDatasetsForApi(
  sourceDatasetVersions: string[],
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
        WHERE d.version_id = ANY($1) AND f.is_archived = ANY($2)
      `,
      [sourceDatasetVersions, isArchivedValues],
      client
    );

  if (!acceptSubset)
    confirmQueryRowsContainVersionIds(
      sourceDatasets,
      sourceDatasetVersions,
      PLURAL_ENTITY_NAME
    );

  return sourceDatasets;
}

/**
 * Get specified source dataset joined with data used for detail API responses.
 * @param sourceDatasetVersion - Version ID of source dataset to get.
 * @param client - Postgres client to use.
 * @returns source dataset with fields for detail API.
 */
export async function getSourceDatasetForDetailApi(
  sourceDatasetVersion: string,
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
      WHERE d.version_id = $1
    `,
    [sourceDatasetVersion],
    client
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(
      `Source dataset with version ID ${sourceDatasetVersion} does not exist`
    );
  return queryResult.rows[0];
}

/**
 * Set the publication status of each of the given source datasets.
 * @param sourceDatasetVersionIds - Version IDs of source datasets to set publication status of.
 * @param publicationStatus - Publication status to set.
 */
export async function setSourceDatasetsPublicationStatus(
  sourceDatasetVersionIds: string[],
  publicationStatus: PUBLICATION_STATUS
): Promise<void> {
  const sdInfoUpdate: Pick<
    HCAAtlasTrackerDBSourceDatasetInfo,
    "publicationStatus"
  > = {
    publicationStatus,
  };

  await doTransaction(async () => {
    const { rows } = await query<
      Pick<HCAAtlasTrackerDBSourceDataset, "version_id">
    >(
      "UPDATE hat.source_datasets SET sd_info = sd_info || $1 WHERE version_id = ANY($2) RETURNING version_id",
      [JSON.stringify(sdInfoUpdate), sourceDatasetVersionIds]
    );
    confirmQueryRowsContainVersionIds(
      rows,
      sourceDatasetVersionIds,
      PLURAL_ENTITY_NAME
    );
  });
}

/**
 * Set the linked source study ID of each of the given source datasets.
 * @param sourceDatasetVersions - Version IDs of source datasets to set source study of.
 * @param sourceStudyId - ID or null to set source study ID to.
 */
export async function setSourceDatasetsSourceStudy(
  sourceDatasetVersions: string[],
  sourceStudyId: string | null
): Promise<void> {
  await doTransaction(async (client) => {
    const queryResult = await client.query<
      Pick<HCAAtlasTrackerDBSourceDataset, "version_id">
    >(
      "UPDATE hat.source_datasets SET source_study_id = $1 WHERE version_id = ANY($2) RETURNING version_id",
      [sourceStudyId, sourceDatasetVersions]
    );

    confirmQueryRowsContainVersionIds(
      queryResult.rows,
      sourceDatasetVersions,
      PLURAL_ENTITY_NAME
    );
  });
}

/**
 * Set the associated file ID referenced by a source dataset and increment its WIP number.
 * @param sourceDatasetId - Source dataset to update.
 * @param fileId - ID to set in the source dataset, referencing its file.
 * @param client - Postgres client to use.
 */
export async function updateSourceDatasetVersion(
  sourceDatasetId: string,
  fileId: string,
  client: pg.PoolClient
): Promise<void> {
  await confirmFileIsOfType(fileId, FILE_TYPE.SOURCE_DATASET, client);
  const result = await client.query(
    "UPDATE hat.source_datasets SET file_id = $1, wip_number = wip_number + 1 WHERE id = $2 AND is_latest",
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
 * Throw an error if any of the specified source datasets are not editable by users (e.g., are archived or non-latest).
 * @param sourceDatasetVersionIds - Version IDs of source datasets to check.
 */
export async function confirmSourceDatasetsAreEditable(
  sourceDatasetVersionIds: string[]
): Promise<void> {
  const queryResult = await query<
    Pick<HCAAtlasTrackerDBSourceDataset, "version_id">
  >(
    `
      SELECT d.version_id
      FROM hat.source_datasets d
      JOIN hat.files f ON f.id = d.file_id
      WHERE d.version_id = ANY($1) AND d.is_latest AND NOT f.is_archived
    `,
    [sourceDatasetVersionIds]
  );
  confirmQueryRowsContainVersionIds(
    queryResult.rows,
    sourceDatasetVersionIds,
    PLURAL_ENTITY_NAME
  );
}

export async function getSourceDatasetVersionForAtlas(
  sourceDatasetId: string,
  atlasId: string,
  client?: pg.PoolClient
): Promise<string> {
  const versions = await getSourceDatasetVersionsPresentOnAtlas(
    [sourceDatasetId],
    atlasId,
    client
  );
  if (versions.length === 0)
    throw new NotFoundError(
      `Atlas with ID ${atlasId} does not have source dataset with ID ${sourceDatasetId}`
    );
  return versions[0].version_id;
}

export async function getSourceDatasetVersionsForAtlas(
  sourceDatasetIds: string[],
  atlasId: string
): Promise<string[]> {
  const presentVersions = await getSourceDatasetVersionsPresentOnAtlas(
    sourceDatasetIds,
    atlasId
  );

  const presentSourceDatasetIds = new Set(presentVersions.map(({ id }) => id));

  const missingSourceDatasetIds = sourceDatasetIds.filter(
    (id) => !presentSourceDatasetIds.has(id)
  );

  if (missingSourceDatasetIds.length > 0)
    throw new NotFoundError(
      `Atlas with ID ${atlasId} does not have source dataset(s): ${missingSourceDatasetIds.join(
        ", "
      )}`
    );

  return presentVersions.map(({ version_id }) => version_id);
}

async function getSourceDatasetVersionsPresentOnAtlas(
  sourceDatasetIds: string[],
  atlasId: string,
  client?: pg.PoolClient
): Promise<Pick<HCAAtlasTrackerDBSourceDataset, "id" | "version_id">[]> {
  return (
    await query<Pick<HCAAtlasTrackerDBSourceDataset, "id" | "version_id">>(
      `
        SELECT d.id, d.version_id
        FROM hat.source_datasets d
        JOIN hat.atlases a ON d.version_id = ANY(a.source_datasets)
        WHERE a.id = $1 AND d.id = ANY($2)
      `,
      [atlasId, sourceDatasetIds],
      client
    )
  ).rows;
}

/**
 * Get the ID of the version of the given source dataset that's linked to the given component atlas.
 * @param sourceDatasetId - ID of the source dataset to get the version ID of.
 * @param componentAtlasVersion - Version ID of the component atlas to get the linked source dataset of.
 * @param client - Postgres client to use.
 * @returns linked source dataset version ID.
 */
export async function getSourceDatasetVersionForComponentAtlas(
  sourceDatasetId: string,
  componentAtlasVersion: string,
  client?: pg.PoolClient
): Promise<string> {
  const queryResult = await query<
    Pick<HCAAtlasTrackerDBSourceDataset, "version_id">
  >(
    `
      SELECT sd.version_id
      FROM hat.source_datasets sd
      JOIN hat.component_atlases ca
      ON sd.version_id = ANY(ca.source_datasets)
      WHERE sd.id = $1 AND ca.version_id = $2
    `,
    [sourceDatasetId, componentAtlasVersion],
    client
  );

  if (queryResult.rows.length === 0)
    throw new NotFoundError(
      `Source dataset with ID ${sourceDatasetId} doesn't exist on component atlas with version ID ${componentAtlasVersion}`
    );

  if (queryResult.rows.length > 1)
    throw new Error(
      `Multiple versions of source dataset ${sourceDatasetId} found linked to component atlas version ${componentAtlasVersion}`
    );

  return queryResult.rows[0].version_id;
}
