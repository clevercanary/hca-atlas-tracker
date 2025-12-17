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
  confirmSourceDatasetsAreAvailable,
  confirmSourceDatasetsExistOnAtlas,
  getAtlasSourceDatasetIds,
  getComponentAtlasSourceDatasetIds,
  getSourceDatasetForDetailApi,
  getSourceDatasetsForApi,
  getSourceStudySourceDatasetIds,
  setSourceDatasetsPublicationStatus,
  setSourceDatasetsSourceStudy,
} from "../data/source-datasets";
import { InvalidOperationError, NotFoundError } from "../utils/api-handler";
import { getSheetTitleForApi } from "../utils/google-sheets-api";
import { confirmComponentAtlasExistsOnAtlas } from "./component-atlases";
import { doOrContinueTransaction, doTransaction, query } from "./database";
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
  sourceStudyId: string
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI[]> {
  await confirmSourceStudyExistsOnAtlas(sourceStudyId, atlasId);
  return await getSourceDatasetsForApi(
    await getSourceStudySourceDatasetIds(sourceStudyId),
    true
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
  isArchivedValue = false
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI[]> {
  return await getSourceDatasetsForApi(
    await getAtlasSourceDatasetIds(atlasId),
    true,
    [isArchivedValue]
  );
}

/**
 * Get all source datasets of the given component atlas.
 * @param atlasId - ID of the atlas that the component atlas is accessed through.
 * @param componentAtlasId - Component atlas ID.
 * @returns database-model source datasets.
 */
export async function getComponentAtlasDatasets(
  atlasId: string,
  componentAtlasId: string
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI[]> {
  await confirmComponentAtlasExistsOnAtlas(componentAtlasId, atlasId);
  return await getSourceDatasetsForApi(
    await getComponentAtlasSourceDatasetIds(componentAtlasId),
    true
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
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBSourceDatasetForDetailAPI> {
  await confirmSourceDatasetIsLinkedToAtlas(sourceDatasetId, atlasId, client);
  return await getSourceDatasetForDetailApi(sourceDatasetId, client);
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
  sourceDatasetId: string
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI> {
  await confirmComponentAtlasExistsOnAtlas(componentAtlasId, atlasId);
  const { exists } = (
    await query<{ exists: boolean }>(
      "SELECT EXISTS(SELECT 1 FROM hat.component_atlases WHERE $1=ANY(source_datasets) AND id=$2)",
      [sourceDatasetId, componentAtlasId]
    )
  ).rows[0];
  if (!exists)
    throw new NotFoundError(
      `Source dataset with ID ${sourceDatasetId} doesn't exist on integrated object with ID ${componentAtlasId} on atlas with ID ${atlasId}`
    );
  const [sourceDataset] = await getSourceDatasetsForApi(
    [sourceDatasetId],
    false,
    [true, false]
  );
  return sourceDataset;
}

/**
 * Create a source dataset.
 * @param client - Optional Postgres client to reuse an existing transaction.
 * @returns ID of the created source dataset.
 */
export async function createSourceDataset(
  client?: pg.PoolClient
): Promise<string> {
  const info = createSourceDatasetInfo();
  return await doOrContinueTransaction(client, async (tx) => {
    const insertResult = await tx.query<
      Pick<HCAAtlasTrackerDBSourceDataset, "id">
    >("INSERT INTO hat.source_datasets (sd_info) VALUES ($1) RETURNING id", [
      JSON.stringify(info),
    ]);
    return insertResult.rows[0].id;
  });
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
  inputData: AtlasSourceDatasetEditData
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI> {
  await confirmSourceDatasetIsLinkedToAtlas(sourceDatasetId, atlasId);
  await confirmSourceDatasetsAreAvailable([sourceDatasetId]);
  const updatedInfoFields: SourceDatasetInfoUpdateFields = {
    capUrl: inputData.capUrl || null,
    metadataSpreadsheetTitle: await getSheetTitleForApi(
      inputData.metadataSpreadsheetUrl,
      "metadataSpreadsheetUrl"
    ),
    metadataSpreadsheetUrl: inputData.metadataSpreadsheetUrl || null,
  };
  return await doTransaction(async (client) => {
    await query(
      "UPDATE hat.source_datasets SET sd_info = sd_info || $1 WHERE id = $2",
      [JSON.stringify(updatedInfoFields), sourceDatasetId],
      client
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
  inputData: SourceDatasetsSetReprocessedStatusData
): Promise<void> {
  await confirmSourceDatasetsExistOnAtlas(inputData.sourceDatasetIds, atlasId);

  await confirmSourceDatasetsAreAvailable(inputData.sourceDatasetIds);

  await query(
    "UPDATE hat.source_datasets SET reprocessed_status = $1 WHERE id = ANY($2)",
    [inputData.reprocessedStatus, inputData.sourceDatasetIds]
  );
}

/**
 * Set the publication status of each of a list of source datasets to a specified value.
 * @param atlasId - ID of the atlas that the source datasets are accessed through.
 * @param inputData - Input data containing the publication status to set and the IDs of the source datasets to set it on.
 */
export async function setAtlasSourceDatasetsPublicationStatus(
  atlasId: string,
  inputData: SourceDatasetsSetPublicationStatusData
): Promise<void> {
  await confirmSourceDatasetsExistOnAtlas(inputData.sourceDatasetIds, atlasId);

  await confirmSourceDatasetsAreAvailable(inputData.sourceDatasetIds);

  await setSourceDatasetsPublicationStatus(
    inputData.sourceDatasetIds,
    inputData.publicationStatus
  );
}

/**
 * Set the linked source source study ID for given source datasets of an atlas.
 * @param atlasId - Atlas that the source datasets are accessed through.
 * @param inputData - Input data specifying source datasets, and source study ID or null.
 */
export async function setAtlasSourceDatasetsSourceStudy(
  atlasId: string,
  inputData: SourceDatasetsSetSourceStudyData
): Promise<void> {
  if (inputData.sourceStudyId !== null)
    await confirmSourceStudyExistsOnAtlas(inputData.sourceStudyId, atlasId);
  await confirmSourceDatasetsExistOnAtlas(inputData.sourceDatasetIds, atlasId);
  await setSourceDatasetsSourceStudy(
    inputData.sourceDatasetIds,
    inputData.sourceStudyId
  );
}

/**
 * Throw an error if the given source dataset is not linked to the given atlas.
 * @param sourceDatasetId - Source dataset ID.
 * @param atlasId - Atlas ID.
 * @param client - Postgres client to use.
 */
export async function confirmSourceDatasetIsLinkedToAtlas(
  sourceDatasetId: string,
  atlasId: string,
  client?: pg.PoolClient
): Promise<void> {
  const atlasSourceDatasetIds = await getAtlasSourceDatasetIds(atlasId, client);
  if (!atlasSourceDatasetIds.includes(sourceDatasetId))
    throw new NotFoundError(
      `Source dataset with ID ${sourceDatasetId} is not linked to atlas with ID ${atlasId}`
    );
}

/**
 * Check whether a list of dataset IDs exist, and throw an error if any don't.
 * @param sourceDatasetIds - Source dataset IDs to check for.
 */
export async function confirmSourceDatasetsExist(
  sourceDatasetIds: string[]
): Promise<void> {
  const queryResult = await query<Pick<HCAAtlasTrackerDBSourceDataset, "id">>(
    "SELECT id FROM hat.source_datasets WHERE id=ANY($1)",
    [sourceDatasetIds]
  );
  if (queryResult.rows.length < sourceDatasetIds.length) {
    const foundIds = queryResult.rows.map((r) => r.id);
    const missingIds = sourceDatasetIds.filter((id) => !foundIds.includes(id));
    throw new InvalidOperationError(
      `No source datasets exist with IDs: ${missingIds.join(", ")}`
    );
  }
}
