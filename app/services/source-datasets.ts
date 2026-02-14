import pg from "pg";
import {
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetForAPI,
  HCAAtlasTrackerDBSourceDatasetForDetailAPI,
  HCAAtlasTrackerDBSourceDatasetInfo,
  PUBLICATION_STATUS,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  AtlasSourceDatasetEditData,
  SourceDatasetsSetPublicationStatusData,
  SourceDatasetsSetReprocessedStatusData,
  SourceDatasetsSetSourceStudyData,
} from "../apis/catalog/hca-atlas-tracker/common/schema";
import {
  confirmSourceDatasetsAreEditable,
  getAtlasSourceDatasetVersionIds,
  getComponentAtlasSourceDatasetVersionIds,
  getSourceDatasetForDetailApi,
  getSourceDatasetsForApi,
  getSourceDatasetVersionForAtlas,
  getSourceDatasetVersionForComponentAtlas,
  getSourceDatasetVersionsForAtlas,
  getSourceStudySourceDatasetVersionIds,
  setSourceDatasetsPublicationStatus,
  setSourceDatasetsSourceStudy,
} from "../data/source-datasets";
import { getSheetTitleForApi } from "../utils/google-sheets-api";
import { getComponentAtlasVersionForAtlas } from "./component-atlases";
import { doTransaction, query } from "./database";
import { confirmSourceStudyExistsOnAtlas } from "./source-studies";

type SourceDatasetInfoUpdateFields = Pick<
  HCAAtlasTrackerDBSourceDatasetInfo,
  "capUrl" | "metadataSpreadsheetTitle" | "metadataSpreadsheetUrl"
>;

export interface UpdatedSourceDatasetsInfo {
  created: string[];
  deleted: string[];
  modified: string[];
}

/**
 * Get all source datasets of the given source study.
 * @param atlasId - ID of the atlas that the source study is accesed through.
 * @param sourceStudyId - Source study ID.
 * @returns database-model source datasets.
 */
export async function getSourceStudyDatasets(
  atlasId: string,
  sourceStudyId: string,
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI[]> {
  await confirmSourceStudyExistsOnAtlas(sourceStudyId, atlasId);
  return await getSourceDatasetsForApi(
    await getSourceStudySourceDatasetVersionIds(sourceStudyId, atlasId),
    true,
  );
}

/**
 * Get all source datasets linked to the given atlas.
 * @param atlasId - Atlas ID.
 * @param isArchivedValue - Value of `is_archived` to limit source datasets to. (Default false)
 * @returns database-model source datasets.
 */
export async function getAtlasDatasets(
  atlasId: string,
  isArchivedValue = false,
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI[]> {
  return await getSourceDatasetsForApi(
    await getAtlasSourceDatasetVersionIds(atlasId),
    true,
    [isArchivedValue],
  );
}

/**
 * Get all source datasets of the latest version of the given component atlas.
 * @param atlasId - ID of the atlas that the component atlas is accessed through.
 * @param componentAtlasId - Component atlas ID.
 * @returns database-model source datasets.
 */
export async function getComponentAtlasDatasets(
  atlasId: string,
  componentAtlasId: string,
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI[]> {
  const componentAtlasVersion = await getComponentAtlasVersionForAtlas(
    componentAtlasId,
    atlasId,
  );
  return await getSourceDatasetsForApi(
    await getComponentAtlasSourceDatasetVersionIds(componentAtlasVersion),
    true,
  );
}

/**
 * Get a source dataset linked to an atlas.
 * @param atlasId - Atlas ID.
 * @param sourceDatasetId - Source dataset ID.
 * @param client - Postgres client to use.
 * @returns database-model source dataset.
 */
export async function getAtlasSourceDataset(
  atlasId: string,
  sourceDatasetId: string,
  client?: pg.PoolClient,
): Promise<HCAAtlasTrackerDBSourceDatasetForDetailAPI> {
  const sourceDatasetVersion = await getSourceDatasetVersionForAtlas(
    sourceDatasetId,
    atlasId,
    client,
  );
  return await getSourceDatasetForDetailApi(sourceDatasetVersion, client);
}

/**
 * Get a source dataset of a component atlas.
 * @param atlasId - ID of the atlas that the source dataset is accessed through.
 * @param componentAtlasId - ID of the component atlas that the source dataset is accessed through.
 * @param sourceDatasetId - Source dataset ID.
 * @returns database model of the source dataset.
 */
export async function getComponentAtlasSourceDataset(
  atlasId: string,
  componentAtlasId: string,
  sourceDatasetId: string,
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI> {
  const componentAtlasVersion = await getComponentAtlasVersionForAtlas(
    componentAtlasId,
    atlasId,
  );
  const sourceDatasetVersion = await getSourceDatasetVersionForComponentAtlas(
    sourceDatasetId,
    componentAtlasVersion,
  );
  const [sourceDataset] = await getSourceDatasetsForApi(
    [sourceDatasetVersion],
    false,
    [true, false],
  );
  return sourceDataset;
}

/**
 * Create a source dataset.
 * @param fileId - Associated file ID for the new source dataset to reference.
 * @param conceptId - Associated concept ID for the new source dataset to reference.
 * @param client - Postgres client to reuse an existing transaction.
 * @returns version ID of the created source dataset.
 */
export async function createSourceDataset(
  fileId: string,
  conceptId: string,
  client: pg.PoolClient,
): Promise<string> {
  const info = createSourceDatasetInfo();
  const insertResult = await client.query<
    Pick<HCAAtlasTrackerDBSourceDataset, "version_id">
  >(
    "INSERT INTO hat.source_datasets (sd_info, file_id, id) VALUES ($1, $2, $3) RETURNING version_id",
    [JSON.stringify(info), fileId, conceptId],
  );
  return insertResult.rows[0].version_id;
}

function createSourceDatasetInfo(): HCAAtlasTrackerDBSourceDatasetInfo {
  return {
    capUrl: null,
    metadataSpreadsheetTitle: null,
    metadataSpreadsheetUrl: null,
    publicationStatus: PUBLICATION_STATUS.UNSPECIFIED,
  };
}

export async function updateAtlasSourceDataset(
  atlasId: string,
  sourceDatasetId: string,
  inputData: AtlasSourceDatasetEditData,
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI> {
  const sourceDatasetVersion = await getSourceDatasetVersionForAtlas(
    sourceDatasetId,
    atlasId,
  );
  await confirmSourceDatasetsAreEditable([sourceDatasetVersion]);
  const updatedInfoFields: SourceDatasetInfoUpdateFields = {
    capUrl: inputData.capUrl || null,
    metadataSpreadsheetTitle: await getSheetTitleForApi(
      inputData.metadataSpreadsheetUrl,
      "metadataSpreadsheetUrl",
    ),
    metadataSpreadsheetUrl: inputData.metadataSpreadsheetUrl || null,
  };
  return await doTransaction(async (client) => {
    await query(
      "UPDATE hat.source_datasets SET sd_info = sd_info || $1 WHERE version_id = $2",
      [JSON.stringify(updatedInfoFields), sourceDatasetVersion],
      client,
    );
    return await getAtlasSourceDataset(atlasId, sourceDatasetId, client);
  });
}

/**
 * Set the reprocessed status of each of a list of source datasets to a specified value.
 * @param atlasId - ID of the atlas that the source datasets are accessed through.
 * @param inputData - Input data containing the reprocessed status to set and the IDs of the source datasets to set it on.
 */
export async function setAtlasSourceDatasetsReprocessedStatus(
  atlasId: string,
  inputData: SourceDatasetsSetReprocessedStatusData,
): Promise<void> {
  const sourceDatasetVersions = await getSourceDatasetVersionsForAtlas(
    inputData.sourceDatasetIds,
    atlasId,
  );

  await confirmSourceDatasetsAreEditable(sourceDatasetVersions);

  await query(
    "UPDATE hat.source_datasets SET reprocessed_status = $1 WHERE version_id = ANY($2)",
    [inputData.reprocessedStatus, sourceDatasetVersions],
  );
}

/**
 * Set the publication status of each of a list of source datasets to a specified value.
 * @param atlasId - ID of the atlas that the source datasets are accessed through.
 * @param inputData - Input data containing the publication status to set and the IDs of the source datasets to set it on.
 */
export async function setAtlasSourceDatasetsPublicationStatus(
  atlasId: string,
  inputData: SourceDatasetsSetPublicationStatusData,
): Promise<void> {
  const sourceDatasetVersions = await getSourceDatasetVersionsForAtlas(
    inputData.sourceDatasetIds,
    atlasId,
  );

  await confirmSourceDatasetsAreEditable(sourceDatasetVersions);

  await setSourceDatasetsPublicationStatus(
    sourceDatasetVersions,
    inputData.publicationStatus,
  );
}

/**
 * Set the linked source source study ID for given source datasets of an atlas.
 * @param atlasId - Atlas that the source datasets are accessed through.
 * @param inputData - Input data specifying source datasets, and source study ID or null.
 */
export async function setAtlasSourceDatasetsSourceStudy(
  atlasId: string,
  inputData: SourceDatasetsSetSourceStudyData,
): Promise<void> {
  if (inputData.sourceStudyId !== null)
    await confirmSourceStudyExistsOnAtlas(inputData.sourceStudyId, atlasId);
  const sourceDatasetVersions = await getSourceDatasetVersionsForAtlas(
    inputData.sourceDatasetIds,
    atlasId,
  );
  await confirmSourceDatasetsAreEditable(sourceDatasetVersions);
  await setSourceDatasetsSourceStudy(
    sourceDatasetVersions,
    inputData.sourceStudyId,
  );
}
