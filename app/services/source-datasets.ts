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
  NewSourceDatasetData,
  SourceDatasetEditData,
  SourceDatasetsSetPublicationStatusData,
  SourceDatasetsSetReprocessedStatusData,
  SourceDatasetsSetSourceStudyData,
} from "../apis/catalog/hca-atlas-tracker/common/schema";
import {
  confirmSourceDatasetIsLinkedToStudy,
  confirmSourceDatasetsAreAvailable,
  confirmSourceDatasetsExistOnAtlas,
  getAtlasSourceDatasetIds,
  getComponentAtlasSourceDatasetIds,
  getSourceDatasetForDetailApi,
  getSourceDatasetsForApi,
  getSourceStudySourceDatasetIds,
  setSourceDatasetsSourceStudy,
} from "../data/source-datasets";
import { InvalidOperationError, NotFoundError } from "../utils/api-handler";
import { getSheetTitleForApi } from "../utils/google-sheets-api";
import {
  confirmComponentAtlasExistsOnAtlas,
  removeSourceDatasetsFromAllComponentAtlases,
  updateFieldsForComponentAtlasesHavingSourceDatasets,
} from "./component-atlases";
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
 * Get a source dataset.
 * @param atlasId - ID of the atlas that the source dataset is accessed through.
 * @param sourceStudyId - ID of the source study that the source dataset is accessed through.
 * @param sourceDatasetId - Source dataset ID.
 * @param client - Postgres client to use.
 * @returns database model of the source dataset.
 */
export async function getSourceDataset(
  atlasId: string,
  sourceStudyId: string,
  sourceDatasetId: string,
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI> {
  await confirmSourceStudyExistsOnAtlas(
    sourceStudyId,
    atlasId,
    undefined,
    client
  );
  await confirmSourceDatasetIsLinkedToStudy(
    sourceDatasetId,
    sourceStudyId,
    client
  );
  const [sourceDataset] = await getSourceDatasetsForApi(
    [sourceDatasetId],
    false,
    [false],
    client
  );
  return sourceDataset;
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
  const { exists } = (
    await query<{ exists: boolean }>(
      "SELECT EXISTS(SELECT 1 FROM hat.component_atlases WHERE $1=ANY(source_datasets) AND id=$2 AND atlas_id=$3)",
      [sourceDatasetId, componentAtlasId, atlasId]
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
 * Create a source dataset for the given source study.
 * @param atlasId - ID of the atlas that the source study is accessed through.
 * @param sourceStudyId - Source study ID.
 * @param inputData - Values for the new source dataset.
 * @returns database model of the new source dataset.
 */
export async function createSourceDatasetForAtlasSourceStudy(
  atlasId: string,
  sourceStudyId: string,
  inputData: NewSourceDatasetData
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI> {
  await confirmSourceStudyExistsOnAtlas(sourceStudyId, atlasId);
  return await doTransaction(async (client) => {
    const sourceDatasetId = await createSourceDataset(
      sourceStudyId,
      inputData,
      client
    );
    return await getSourceDataset(
      atlasId,
      sourceStudyId,
      sourceDatasetId,
      client
    );
  });
}

/**
 * Create a source dataset.
 * @param sourceStudyId - ID of the source study to associate the source dataset with, if any.
 * @param inputData - Values for the new source dataset.
 * @param client - Optional Postgres client to reuse an existing transaction.
 * @returns ID of the created source dataset.
 */
export async function createSourceDataset(
  sourceStudyId: string | null,
  inputData: NewSourceDatasetData,
  client?: pg.PoolClient
): Promise<string> {
  const info = sourceDatasetInputDataToDbData(inputData);
  return await doOrContinueTransaction(client, async (tx) => {
    const insertResult = await tx.query<
      Pick<HCAAtlasTrackerDBSourceDataset, "id">
    >(
      "INSERT INTO hat.source_datasets (sd_info, source_study_id) VALUES ($1, $2) RETURNING id",
      [JSON.stringify(info), sourceStudyId]
    );
    return insertResult.rows[0].id;
  });
}

/**
 * Update a source dataset.
 * @param atlasId - ID of the atlas that the source dataset is accessed through.
 * @param sourceStudyId - ID of the source study that the source dataset is accessed through.
 * @param sourceDatasetId - Source dataset ID.
 * @param inputData - Values to update the source dataset with.
 * @returns database model of the updated source dataset.
 */
export async function updateSourceDataset(
  atlasId: string,
  sourceStudyId: string,
  sourceDatasetId: string,
  inputData: SourceDatasetEditData
): Promise<HCAAtlasTrackerDBSourceDatasetForAPI> {
  await confirmSourceStudyExistsOnAtlas(sourceStudyId, atlasId);
  await confirmSourceDatasetIsNonCellxGene(sourceDatasetId, "edit");
  const info = sourceDatasetInputDataToDbData(inputData);
  return await doTransaction(async (client) => {
    const updateResult = await client.query<
      Pick<HCAAtlasTrackerDBSourceDataset, "id">
    >(
      "UPDATE hat.source_datasets SET sd_info=$1 WHERE id=$2 AND source_study_id=$3 RETURNING id",
      [JSON.stringify(info), sourceDatasetId, sourceStudyId]
    );
    if (updateResult.rows.length === 0)
      throw getSourceDatasetNotFoundError(sourceStudyId, sourceDatasetId);
    await updateFieldsForComponentAtlasesHavingSourceDatasets(
      [sourceDatasetId],
      client
    );
    return await getSourceDataset(
      atlasId,
      sourceStudyId,
      updateResult.rows[0].id,
      client
    );
  });
}

export async function resetSourceDatasetInfo(
  sourceDatasetId: string,
  inputData: NewSourceDatasetData,
  client?: pg.PoolClient
): Promise<void> {
  const info = sourceDatasetInputDataToDbData(inputData);
  await doOrContinueTransaction(client, async (tx) => {
    await confirmSourceDatasetIsNonCellxGene(sourceDatasetId, "edit", tx);
    await tx.query(
      "UPDATE hat.source_datasets SET sd_info = $2 WHERE id = $1",
      [sourceDatasetId, JSON.stringify(info)]
    );
    await updateFieldsForComponentAtlasesHavingSourceDatasets(
      [sourceDatasetId],
      tx
    );
  });
}

function sourceDatasetInputDataToDbData(
  inputData: NewSourceDatasetData | SourceDatasetEditData
): HCAAtlasTrackerDBSourceDatasetInfo {
  return {
    assay: [],
    capUrl: null,
    cellCount: 0,
    cellxgeneDatasetId: null,
    cellxgeneDatasetVersion: null,
    cellxgeneExplorerUrl: null,
    disease: [],
    metadataSpreadsheetTitle: null,
    metadataSpreadsheetUrl: null,
    publicationStatus: PUBLICATION_STATUS.UNSPECIFIED,
    suspensionType: [],
    tissue: [],
    title: inputData.title,
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

  const sdInfoUpdate: Pick<
    HCAAtlasTrackerDBSourceDatasetInfo,
    "publicationStatus"
  > = {
    publicationStatus: inputData.publicationStatus,
  };

  await query(
    "UPDATE hat.source_datasets SET sd_info = sd_info || $1 WHERE id = ANY($2)",
    [JSON.stringify(sdInfoUpdate), inputData.sourceDatasetIds]
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
 * Delete a source dataset.
 * @param atlasId - ID of the atlas that the source dataset is accessed through.
 * @param sourceStudyId - ID of the source study that the source dataset is accessed through.
 * @param sourceDatasetId - Source dataset ID.
 */
export async function deleteSourceDataset(
  atlasId: string,
  sourceStudyId: string,
  sourceDatasetId: string
): Promise<void> {
  await doTransaction(async (client) => {
    await confirmSourceStudyExistsOnAtlas(
      sourceStudyId,
      atlasId,
      undefined,
      client
    );
    await confirmSourceDatasetCanBeExplicitlyDeleted(sourceDatasetId, client);
    const queryResult = await client.query(
      "DELETE FROM hat.source_datasets WHERE id=$1 AND source_study_id=$2",
      [sourceDatasetId, sourceStudyId]
    );
    if (queryResult.rowCount === 0)
      throw getSourceDatasetNotFoundError(sourceStudyId, sourceDatasetId);
    await removeSourceDatasetsFromAllComponentAtlases(
      [sourceDatasetId],
      client
    );
  });
}

/**
 * Throw an error if the given source dataset cannot be deleted as an explicit user action.
 * @param sourceDatasetId - Source dataset ID.
 * @param client - Postgres client to use.
 */
async function confirmSourceDatasetCanBeExplicitlyDeleted(
  sourceDatasetId: string,
  client: pg.PoolClient
): Promise<void> {
  await confirmSourceDatasetIsNonCellxGene(sourceDatasetId, "delete", client);

  const linkedAtlasesQueryResult = await query(
    "SELECT EXISTS(SELECT 1 FROM hat.atlases a WHERE $1 = ANY(a.source_datasets))",
    [sourceDatasetId],
    client
  );
  if (linkedAtlasesQueryResult.rows[0].exists)
    throw new InvalidOperationError(
      `Source dataset with ID ${sourceDatasetId} is linked to atlas(es)`
    );
}

/**
 * Throw an error if the given source dataset is a CELLxGENE dataset.
 * @param sourceDatasetId - ID of the source dataset to check.
 * @param attemptedOperationVerb - Word to use in the error message describing the operation attempted on the source dataset.
 * @param client - Postgres client to use.
 */
async function confirmSourceDatasetIsNonCellxGene(
  sourceDatasetId: string,
  attemptedOperationVerb: string,
  client?: pg.PoolClient
): Promise<void> {
  const { is_cellxgene } = (
    await query<{ is_cellxgene: boolean }>(
      "SELECT NOT sd_info->'cellxgeneDatasetId' = 'null' as is_cellxgene FROM hat.source_datasets WHERE id=$1",
      [sourceDatasetId],
      client
    )
  ).rows[0];
  if (is_cellxgene)
    throw new InvalidOperationError(
      `Can't ${attemptedOperationVerb} CELLxGENE source dataset`
    );
}

/**
 * Throw an error if the given source dataset does not exist on a source study of the given atlas.
 * @param sourceDatasetId - Source dataset ID.
 * @param atlasId - Atlas ID.
 * @param client - Postgres client to use.
 */
export async function confirmSourceDatasetStudyIsOnAtlas(
  sourceDatasetId: string,
  atlasId: string,
  client?: pg.PoolClient
): Promise<void> {
  const queryResult = await query(
    `
      SELECT
        EXISTS(
          SELECT 1 FROM hat.source_datasets d
          WHERE d.id = $1 AND a.source_studies ? d.source_study_id::text
        )
      FROM hat.atlases a
      WHERE a.id = $2
    `,
    [sourceDatasetId, atlasId],
    client
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);
  if (!queryResult.rows[0].exists)
    throw new InvalidOperationError(
      `Source dataset with ID ${sourceDatasetId} is not on a source study of atlas with ID ${atlasId}`
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

function getSourceDatasetNotFoundError(
  sourceStudyId: string,
  sourceDatasetId: string
): NotFoundError {
  return new NotFoundError(
    `Source dataset with ID ${sourceDatasetId} doesn't exist on source study with ID ${sourceStudyId}`
  );
}
