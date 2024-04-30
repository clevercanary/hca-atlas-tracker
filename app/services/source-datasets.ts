import { ValidationError } from "yup";
import {
  ATLAS_STATUS,
  DOI_STATUS,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetMinimumColumns,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewSourceDatasetData,
  SourceDatasetEditData,
} from "../apis/catalog/hca-atlas-tracker/common/schema";
import { AccessError, NotFoundError } from "../utils/api-handler";
import { getCrossrefPublicationInfo } from "../utils/crossref/crossref";
import { normalizeDoi } from "../utils/doi";
import { getCellxGeneIdByDoi } from "./cellxgene";
import { getPoolClient, query } from "./database";
import { getProjectIdByDoi } from "./hca-projects";

/**
 * Create a new published or unpublished source dataset.
 * @param atlasId - Atlas to add new source dataset to.
 * @param inputData - Values for new source dataset.
 * @returns database model of new source dataset.
 */
export async function createSourceDataset(
  atlasId: string,
  inputData: NewSourceDatasetData
): Promise<HCAAtlasTrackerDBSourceDataset> {
  const atlasExists = (
    await query("SELECT EXISTS(SELECT 1 FROM hat.atlases WHERE id=$1)", [
      atlasId,
    ])
  ).rows[0].exists;
  if (!atlasExists) {
    throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);
  }

  const existingDataset = await getExistingDataset(inputData);
  if (existingDataset) {
    await query(
      "UPDATE hat.atlases SET source_datasets=source_datasets||$1 WHERE id=$2 AND NOT source_datasets @> $1",
      [JSON.stringify([existingDataset.id]), atlasId]
    );
    return existingDataset;
  }

  const newInfo = await sourceDatasetInputDataToDbData(inputData);

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    // Add the new source dataset
    const newDataset = (
      await client.query<HCAAtlasTrackerDBSourceDataset>(
        "INSERT INTO hat.source_datasets (doi, sd_info) VALUES ($1, $2) RETURNING *",
        [newInfo.doi, JSON.stringify(newInfo.sd_info)]
      )
    ).rows[0];
    // Update the atlas's list of source datasets
    await client.query(
      "UPDATE hat.atlases SET source_datasets=source_datasets||$1 WHERE id=$2",
      [JSON.stringify([newDataset.id]), atlasId]
    );
    await client.query("COMMIT");
    return newDataset;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Get existing source dataset matching values submitted to create a source dataset.
 * @param inputData - Source dataset creation values.
 * @returns existing dataset or null.
 */
async function getExistingDataset(
  inputData: NewSourceDatasetData
): Promise<HCAAtlasTrackerDBSourceDataset | null> {
  if (!inputData.doi) return null;
  const doi = normalizeDoi(inputData.doi);
  return (
    (
      await query<HCAAtlasTrackerDBSourceDataset>(
        "SELECT * FROM hat.source_datasets WHERE doi=$1 OR sd_info->'publication'->>'preprintOfDoi'=$1 OR sd_info->'publication'->>'hasPreprintDoi'=$1",
        [doi]
      )
    ).rows[0] ?? null
  );
}

/**
 * Update a published or unpublished source dataset.
 * @param atlasId - Atlas that the source dataset is accessed through.
 * @param sdId - Source dataset to update.
 * @param inputData - Values to update the source dataset with.
 * @returns database model of updated source dataset.
 */
export async function updateSourceDataset(
  atlasId: string,
  sdId: string,
  inputData: SourceDatasetEditData
): Promise<HCAAtlasTrackerDBSourceDataset> {
  await confirmSourceDatasetExistsOnAtlas(sdId, atlasId);

  const newInfo = await sourceDatasetInputDataToDbData(inputData);

  const queryResult = await query<HCAAtlasTrackerDBSourceDataset>(
    "UPDATE hat.source_datasets SET doi=$1, sd_info=$2 WHERE id=$3 RETURNING *",
    [newInfo.doi, JSON.stringify(newInfo.sd_info), sdId]
  );

  if (queryResult.rows.length === 0)
    throw new NotFoundError(`Source dataset with ID ${sdId} doesn't exist`);

  return queryResult.rows[0];
}

/**
 * Derive source dataset information from input values.
 * @param inputData - Values to derive source dataset from.
 * @returns database model of values needed to define a source dataset.
 */
async function sourceDatasetInputDataToDbData(
  inputData: NewSourceDatasetData | SourceDatasetEditData
): Promise<HCAAtlasTrackerDBSourceDatasetMinimumColumns> {
  return inputData.doi
    ? await makePublishedSourceDatasetDbData(inputData)
    : makeUnpublishedSourceDatasetDbData(inputData);
}

/**
 * Derive published source dataset information from input values.
 * @param inputData - Values to derive source dataset from.
 * @returns database model of values needed to define a source dataset.
 */
async function makePublishedSourceDatasetDbData(
  inputData: NewSourceDatasetData | SourceDatasetEditData
): Promise<HCAAtlasTrackerDBSourceDatasetMinimumColumns> {
  const doi = normalizeDoi(inputData.doi);

  let publication;
  try {
    publication = await getCrossrefPublicationInfo(doi);
  } catch (e) {
    if (e instanceof ValidationError) {
      throw new ValidationError(
        `Crossref data doesn't fit: ${e.message}`,
        undefined,
        "doi"
      );
    }
    throw e;
  }

  const dois = [
    ...(publication?.preprintOfDoi ? [publication.preprintOfDoi] : []),
    doi,
    ...(publication?.hasPreprintDoi ? [publication.hasPreprintDoi] : []),
  ];

  const hcaProjectId = getProjectIdByDoi(dois);

  const cellxgeneCollectionId = getCellxGeneIdByDoi(dois);

  return {
    doi,
    sd_info: {
      cellxgeneCollectionId,
      doiStatus: publication ? DOI_STATUS.OK : DOI_STATUS.DOI_NOT_ON_CROSSREF,
      hcaProjectId,
      publication,
      unpublishedInfo: null,
    },
  };
}

/**
 * Derive unpublished source dataset information from input values.
 * @param inputData - Values to derive source dataset from.
 * @returns database model of values needed to define a source dataset.
 */
function makeUnpublishedSourceDatasetDbData(
  inputData: NewSourceDatasetData | SourceDatasetEditData
): HCAAtlasTrackerDBSourceDatasetMinimumColumns {
  return {
    doi: null,
    sd_info: {
      cellxgeneCollectionId: null,
      doiStatus: DOI_STATUS.NA,
      hcaProjectId: null,
      publication: null,
      unpublishedInfo: {
        contactEmail: inputData.contactEmail,
        referenceAuthor: inputData.referenceAuthor,
        title: inputData.title,
      },
    },
  };
}

/**
 * Throw an error if the given source dataset doesn't exist on the given atlas.
 * @param sdId - Source dataset ID.
 * @param atlasId - Atlas ID.
 * @param limitToStatuses - If specified, statuses that the atlas must have.
 */
export async function confirmSourceDatasetExistsOnAtlas(
  sdId: string,
  atlasId: string,
  limitToStatuses?: ATLAS_STATUS[]
): Promise<void> {
  const queryResult = await query<
    Pick<HCAAtlasTrackerDBAtlas, "source_datasets" | "status">
  >("SELECT source_datasets, status FROM hat.atlases WHERE id=$1", [atlasId]);
  if (queryResult.rows.length === 0)
    throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);
  const { source_datasets, status } = queryResult.rows[0];
  if (limitToStatuses && !limitToStatuses.includes(status))
    throw new AccessError(`Can't access atlas with ID ${atlasId}`);
  if (!source_datasets.includes(sdId))
    throw new NotFoundError(
      `Source dataset with ID ${sdId} doesn't exist on atlas with ID ${atlasId}`
    );
}
