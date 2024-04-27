import { ValidationError } from "yup";
import {
  DOI_STATUS,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetMinimumColumns,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewSourceDatasetData,
  SourceDatasetEditData,
} from "../apis/catalog/hca-atlas-tracker/common/schema";
import { NotFoundError } from "../utils/api-handler";
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
