import { CellxGeneDataset } from "app/utils/cellxgene-api";
import pg from "pg";
import {
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetInfo,
  HCAAtlasTrackerDBSourceDatasetWithCellxGeneId,
  HCAAtlasTrackerDBSourceDatasetWithStudyProperties,
  HCAAtlasTrackerDBSourceStudy,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewSourceDatasetData,
  SourceDatasetEditData,
} from "../apis/catalog/hca-atlas-tracker/common/schema";
import { InvalidOperationError, NotFoundError } from "../utils/api-handler";
import { getCellxGeneDatasetsByCollectionId } from "./cellxgene";
import {
  getComponentAtlasNotFoundError,
  removeSourceDatasetsFromAllComponentAtlases,
  updateFieldsForComponentAtlasesHavingSourceDatasets,
} from "./component-atlases";
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
      "SELECT d.*, s.doi, s.study_info FROM hat.source_datasets d JOIN hat.source_studies s ON d.source_study_id = s.id WHERE s.id = $1",
      [sourceStudyId]
    );
  return queryResult.rows;
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
): Promise<HCAAtlasTrackerDBSourceDatasetWithStudyProperties[]> {
  const componentAtlasResult = await query<
    Pick<HCAAtlasTrackerDBComponentAtlas, "source_datasets">
  >(
    "SELECT source_datasets FROM hat.component_atlases WHERE id=$1 AND atlas_id=$2",
    [componentAtlasId, atlasId]
  );
  if (componentAtlasResult.rows.length === 0)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);
  const sourceDatasetIds = componentAtlasResult.rows[0].source_datasets;
  const queryResult =
    await query<HCAAtlasTrackerDBSourceDatasetWithStudyProperties>(
      "SELECT d.*, s.doi, s.study_info FROM hat.source_datasets d JOIN hat.source_studies s ON d.source_study_id = s.id WHERE d.id = ANY($1)",
      [sourceDatasetIds]
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
      "SELECT d.*, s.doi, s.study_info FROM hat.source_datasets d JOIN hat.source_studies s ON d.source_study_id = s.id WHERE d.id = $1 AND s.id = $2",
      [sourceDatasetId, sourceStudyId],
      client
    );
  if (queryResult.rows.length === 0)
    throw getSourceDatasetNotFoundError(sourceStudyId, sourceDatasetId);
  return queryResult.rows[0];
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
): Promise<HCAAtlasTrackerDBSourceDatasetWithStudyProperties> {
  const { exists } = (
    await query<{ exists: boolean }>(
      "SELECT EXISTS(SELECT 1 FROM hat.component_atlases WHERE $1=ANY(source_datasets) AND id=$2 AND atlas_id=$3)",
      [sourceDatasetId, componentAtlasId, atlasId]
    )
  ).rows[0];
  if (!exists)
    throw new NotFoundError(
      `Source dataset with ID ${sourceDatasetId} doesn't exist on integration object with ID ${componentAtlasId} on atlas with ID ${atlasId}`
    );
  const queryResult =
    await query<HCAAtlasTrackerDBSourceDatasetWithStudyProperties>(
      "SELECT d.*, s.doi, s.study_info FROM hat.source_datasets d JOIN hat.source_studies s ON d.source_study_id = s.id WHERE d.id = $1",
      [sourceDatasetId]
    );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(
      `Source dataset with ID ${sourceDatasetId} doesn't exist`
    );
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

function sourceDatasetInputDataToDbData(
  inputData: NewSourceDatasetData | SourceDatasetEditData
): HCAAtlasTrackerDBSourceDatasetInfo {
  return {
    assay: [],
    cellCount: 0,
    cellxgeneDatasetId: null,
    cellxgeneDatasetVersion: null,
    cellxgeneExplorerUrl: null,
    disease: [],
    suspensionType: [],
    tissue: [],
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
  await confirmSourceStudyExistsOnAtlas(sourceStudyId, atlasId);
  await confirmSourceDatasetIsNonCellxGene(sourceDatasetId, "delete");
  await doTransaction(async (client) => {
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
 * Delete all source datasets of the specified source study.
 * @param sourceStudyId - Source study ID.
 * @param client - Postgres client to use.
 */
export async function deleteSourceDatasetsOfSourceStudy(
  sourceStudyId: string,
  client: pg.PoolClient
): Promise<void> {
  const queryResult = await client.query<
    Pick<HCAAtlasTrackerDBSourceDataset, "id">
  >("DELETE FROM hat.source_datasets WHERE source_study_id=$1 RETURNING id", [
    sourceStudyId,
  ]);
  const deletedSourceDatasetIds = queryResult.rows.map(({ id }) => id);
  await removeSourceDatasetsFromAllComponentAtlases(
    deletedSourceDatasetIds,
    client
  );
}

/**
 * Create and update CELLxGENE source datasets for all source studies with CELLxGENE IDs.
 */
export async function updateCellxGeneSourceDatasets(): Promise<void> {
  const existingDatasets = (
    await query<HCAAtlasTrackerDBSourceDatasetWithCellxGeneId>(
      "SELECT * FROM hat.source_datasets WHERE NOT sd_info->'cellxgeneDatasetId' = 'null'"
    )
  ).rows;

  const existingDatasetsByCxgId = new Map(
    existingDatasets.map((dataset) => [
      dataset.sd_info.cellxgeneDatasetId,
      dataset,
    ])
  );

  const sourceStudies = (
    await query<{ id: string; study_info: { cellxgeneCollectionId: string } }>(
      "SELECT id, study_info FROM hat.source_studies WHERE NOT study_info->'cellxgeneCollectionId' = 'null'"
    )
  ).rows;

  const updatedDatasetIds: string[] = [];

  for (const sourceStudy of sourceStudies) {
    const studyUpdatedDatasetIds = await updateCellxGeneSourceDatasetsForStudy(
      sourceStudy.id,
      sourceStudy.study_info.cellxgeneCollectionId,
      existingDatasetsByCxgId
    );
    updatedDatasetIds.push(...studyUpdatedDatasetIds);
  }

  await updateFieldsForComponentAtlasesHavingSourceDatasets(updatedDatasetIds);
}

/**
 * Create and update CELLxGENE source datasets for an individual source study.
 * @param sourceStudy - Source study to update source datasets for.
 * @param client - Postgres client to use.
 */
export async function updateSourceStudyCellxGeneDatasets(
  sourceStudy: HCAAtlasTrackerDBSourceStudy,
  client?: pg.PoolClient
): Promise<void> {
  if (!sourceStudy.study_info.cellxgeneCollectionId) return;

  const existingDatasets = (
    await query<HCAAtlasTrackerDBSourceDatasetWithCellxGeneId>(
      "SELECT * FROM hat.source_datasets WHERE source_study_id=$1 AND NOT sd_info->'cellxgeneDatasetId' = 'null'",
      [sourceStudy.id],
      client
    )
  ).rows;

  const existingDatasetsByCxgId = new Map(
    existingDatasets.map((dataset) => [
      dataset.sd_info.cellxgeneDatasetId,
      dataset,
    ])
  );

  const updatedDatasetIds = await updateCellxGeneSourceDatasetsForStudy(
    sourceStudy.id,
    sourceStudy.study_info.cellxgeneCollectionId,
    existingDatasetsByCxgId,
    client
  );

  await updateFieldsForComponentAtlasesHavingSourceDatasets(
    updatedDatasetIds,
    client
  );
}

/**
 * Create missing source datasets and update outdated source datasets for a given source study from a given CELLxGENE collection.
 * @param sourceStudyId - ID of the source study to update source datasets for.
 * @param cellxgeneCollectionId - ID of the source study's CELLxGENE collection, to get datasets from.
 * @param existingDatasetsByCxgId - Map of existing CELLxGENE source datasets of the source study.
 * @param client - Postgres client to use.
 * @returns IDs of any source datasets that were created or updated.
 */
async function updateCellxGeneSourceDatasetsForStudy(
  sourceStudyId: string,
  cellxgeneCollectionId: string,
  existingDatasetsByCxgId: Map<string, HCAAtlasTrackerDBSourceDataset>,
  client?: pg.PoolClient
): Promise<string[]> {
  const collectionDatasets = getCellxGeneDatasetsByCollectionId(
    cellxgeneCollectionId
  );

  if (!collectionDatasets) return [];

  const updatedDatasetIds: string[] = [];

  for (const cxgDataset of collectionDatasets) {
    const existingDataset = existingDatasetsByCxgId.get(cxgDataset.dataset_id);

    if (
      existingDataset?.sd_info.cellxgeneDatasetVersion ===
      cxgDataset.dataset_version_id
    ) {
      continue;
    }
    const infoJson = JSON.stringify(getCellxGeneSourceDatasetInfo(cxgDataset));

    if (existingDataset) {
      await query(
        "UPDATE hat.source_datasets SET sd_info=$1 WHERE id=$2",
        [infoJson, existingDataset.id],
        client
      );
      updatedDatasetIds.push(existingDataset.id);
    } else {
      const { id: newId } = (
        await query<Pick<HCAAtlasTrackerDBSourceDataset, "id">>(
          "INSERT INTO hat.source_datasets (sd_info, source_study_id) VALUES ($1, $2) RETURNING id",
          [infoJson, sourceStudyId],
          client
        )
      ).rows[0];
      updatedDatasetIds.push(newId);
    }
  }

  return updatedDatasetIds;
}

function getCellxGeneSourceDatasetInfo(
  cxgDataset: CellxGeneDataset
): HCAAtlasTrackerDBSourceDatasetInfo {
  return {
    assay: cxgDataset.assay.map((a) => a.label),
    cellCount: cxgDataset.cell_count,
    cellxgeneDatasetId: cxgDataset.dataset_id,
    cellxgeneDatasetVersion: cxgDataset.dataset_version_id,
    cellxgeneExplorerUrl: cxgDataset.explorer_url,
    disease: cxgDataset.disease.map((d) => d.label),
    suspensionType: cxgDataset.suspension_type,
    tissue: cxgDataset.tissue.map((t) => t.label),
    title: cxgDataset.title,
  };
}

/**
 * Throw an error if the given source dataset is a CELLxGENE dataset.
 * @param sourceDatasetId - ID of the source dataset to check.
 * @param attemptedOperationVerb - Word to use in the error message describing the operation attempted on the source dataset.
 */
async function confirmSourceDatasetIsNonCellxGene(
  sourceDatasetId: string,
  attemptedOperationVerb: string
): Promise<void> {
  const { is_cellxgene } = (
    await query<{ is_cellxgene: boolean }>(
      "SELECT NOT sd_info->'cellxgeneDatasetId' = 'null' as is_cellxgene FROM hat.source_datasets WHERE id=$1",
      [sourceDatasetId]
    )
  ).rows[0];
  if (is_cellxgene)
    throw new InvalidOperationError(
      `Can't ${attemptedOperationVerb} CELLxGENE source dataset`
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
