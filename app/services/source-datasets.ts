import pg from "pg";
import {
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetInfo,
  HCAAtlasTrackerDBSourceDatasetWithStudyProperties,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewSourceDatasetData,
  SourceDatasetEditData,
} from "../apis/catalog/hca-atlas-tracker/common/schema";
import { NotFoundError } from "../utils/api-handler";
import { doTransaction, query } from "./database";
import { confirmSourceStudyExistsOnAtlas } from "./source-studies";

/**
 * Get all source datasets of the given source study.
 * @param atlasId - ID of the atlas that the source study is accesed through.
 * @param sourceStudyId - Source study ID.
 * @returns database-model source datasets.
 */
export async function getSourceStudyDatasets(
  atlasId: string,
  sourceStudyId: string
): Promise<HCAAtlasTrackerDBSourceDatasetWithStudyProperties[]> {
  await confirmSourceStudyExistsOnAtlas(sourceStudyId, atlasId);
  const queryResult =
    await query<HCAAtlasTrackerDBSourceDatasetWithStudyProperties>(
      "SELECT d.*, s.doi, s.study_info FROM hat.source_datasets d JOIN hat.source_studies s ON d.study_id = s.id WHERE s.id = $1",
      [sourceStudyId]
    );
  return queryResult.rows;
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
): Promise<HCAAtlasTrackerDBSourceDatasetWithStudyProperties> {
  await confirmSourceStudyExistsOnAtlas(
    sourceStudyId,
    atlasId,
    undefined,
    client
  );
  const queryResult =
    await query<HCAAtlasTrackerDBSourceDatasetWithStudyProperties>(
      "SELECT d.*, s.doi, s.study_info FROM hat.source_datasets d JOIN hat.source_studies s ON d.study_id = s.id WHERE d.id = $1",
      [sourceDatasetId],
      client
    );
  if (queryResult.rows.length === 0)
    throw getSourceDatasetNotFoundError(sourceStudyId, sourceDatasetId);
  return queryResult.rows[0];
}

/**
 * Create a source dataset for the given source study.
 * @param atlasId - ID of the atlas that the source study is accessed through.
 * @param sourceStudyId - Source study ID.
 * @param inputData - Values for the new source dataset.
 * @returns database model of the new source dataset.
 */
export async function createSourceDataset(
  atlasId: string,
  sourceStudyId: string,
  inputData: NewSourceDatasetData
): Promise<HCAAtlasTrackerDBSourceDatasetWithStudyProperties> {
  await confirmSourceStudyExistsOnAtlas(sourceStudyId, atlasId);
  const info = sourceDatasetInputDataToDbData(inputData);
  return await doTransaction(async (client) => {
    const insertResult = await client.query<
      Pick<HCAAtlasTrackerDBSourceDataset, "id">
    >(
      "INSERT INTO hat.source_datasets (sd_info, source_study_id) VALUES ($1, $2) RETURNING id",
      [JSON.stringify(info), sourceStudyId]
    );
    return await getSourceDataset(
      atlasId,
      sourceStudyId,
      insertResult.rows[0].id,
      client
    );
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
): Promise<HCAAtlasTrackerDBSourceDatasetWithStudyProperties> {
  // TODO disallow for CELLxGENE datasets
  await confirmSourceStudyExistsOnAtlas(sourceStudyId, atlasId);
  const info = sourceDatasetInputDataToDbData(inputData);
  return await doTransaction(async (client) => {
    const updateResult = await client.query<
      Pick<HCAAtlasTrackerDBSourceDataset, "id">
    >("UPDATE hat.source_datasets SET sd_info=$1 WHERE id=$2 RETURNING id", [
      JSON.stringify(info),
      sourceDatasetId,
    ]);
    if (updateResult.rows.length === 0)
      throw getSourceDatasetNotFoundError(sourceStudyId, sourceDatasetId);
    return await getSourceDataset(
      atlasId,
      sourceStudyId,
      updateResult.rows[0].id,
      client
    );
  });
}

function sourceDatasetInputDataToDbData(
  inputData: NewSourceDatasetData | SourceDatasetEditData
): HCAAtlasTrackerDBSourceDatasetInfo {
  return {
    cellCount: 0,
    cellxgeneDatasetId: null,
    cellxgeneDatasetVersion: null,
    title: inputData.title,
  };
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
  // TODO disallow for CELLxGENE datasets
  await confirmSourceStudyExistsOnAtlas(sourceStudyId, atlasId);
  const queryResult = await query(
    "DELETE FROM hat.source_datasets WHERE id=$1 AND source_study_id=$2",
    [sourceDatasetId, sourceStudyId]
  );
  if (queryResult.rowCount === 0)
    throw getSourceDatasetNotFoundError(sourceStudyId, sourceDatasetId);
}

function getSourceDatasetNotFoundError(
  sourceStudyId: string,
  sourceDatasetId: string
): NotFoundError {
  return new NotFoundError(
    `Source dataset with ID ${sourceDatasetId} doesn't exist on source study with ID ${sourceStudyId}`
  );
}
