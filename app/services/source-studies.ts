import pg from "pg";
import { ValidationError } from "yup";
import {
  ATLAS_STATUS,
  DOI_STATUS,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBPublishedSourceStudy,
  HCAAtlasTrackerDBPublishedSourceStudyInfo,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerDBSourceStudyMinimumColumns,
  HCAAtlasTrackerDBSourceStudyWithSourceDatasets,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewPublishedSourceStudyData,
  NewSourceStudyData,
  NewUnpublishedSourceStudyData,
  PublishedSourceStudyEditData,
  SourceStudyEditData,
  UnpublishedSourceStudyEditData,
} from "../apis/catalog/hca-atlas-tracker/common/schema";
import { getPublicationDois } from "../apis/catalog/hca-atlas-tracker/common/utils";
import { AccessError, NotFoundError } from "../utils/api-handler";
import { getCrossrefPublicationInfo } from "../utils/crossref/crossref";
import { normalizeDoi } from "../utils/doi";
import { getCellxGeneIdByDoi } from "./cellxgene";
import { getPoolClient, query } from "./database";
import { getProjectIdByDoi } from "./hca-projects";
import { updateSourceStudyCellxGeneDatasets } from "./source-datasets";
import { updateSourceStudyValidations } from "./validations";

export async function getAtlasSourceStudies(
  atlasId: string
): Promise<HCAAtlasTrackerDBSourceStudyWithSourceDatasets[]> {
  const {
    rows: [atlas],
  } = await query<Pick<HCAAtlasTrackerDBAtlas, "source_studies">>(
    "SELECT source_studies FROM hat.atlases WHERE id=$1",
    [atlasId]
  );
  if (!atlas) {
    throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);
  }
  return atlas.source_studies.length === 0
    ? []
    : (
        await query<HCAAtlasTrackerDBSourceStudyWithSourceDatasets>(
          "SELECT s.*, COUNT(d.*)::int AS source_dataset_count FROM hat.source_studies s LEFT JOIN hat.source_datasets d ON d.source_study_id=s.id WHERE s.id=ANY($1) GROUP BY s.id",
          [atlas.source_studies]
        )
      ).rows;
}

export async function getSourceStudy(
  atlasId: string,
  sourceStudyId: string,
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBSourceStudyWithSourceDatasets> {
  await confirmSourceStudyExistsOnAtlas(
    sourceStudyId,
    atlasId,
    undefined,
    client
  );

  const queryResult =
    await query<HCAAtlasTrackerDBSourceStudyWithSourceDatasets>(
      "SELECT s.*, COUNT(d.*)::int AS source_dataset_count FROM hat.source_studies s LEFT JOIN hat.source_datasets d ON d.source_study_id=s.id WHERE s.id=$1 GROUP BY s.id",
      [sourceStudyId],
      client
    );

  if (queryResult.rows.length === 0)
    throw new NotFoundError(
      `Source study with ID ${sourceStudyId} doesn't exist`
    );

  return queryResult.rows[0];
}

/**
 * Create a new published or unpublished source study.
 * @param atlasId - Atlas to add new source study to.
 * @param inputData - Values for new source study.
 * @returns database model of new source study.
 */
export async function createSourceStudy(
  atlasId: string,
  inputData: NewSourceStudyData
): Promise<HCAAtlasTrackerDBSourceStudyWithSourceDatasets> {
  const atlasExists = (
    await query("SELECT EXISTS(SELECT 1 FROM hat.atlases WHERE id=$1)", [
      atlasId,
    ])
  ).rows[0].exists;
  if (!atlasExists) {
    throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);
  }

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    // If study already exists, add that instead
    const existingStudyId = await getExistingStudyId(inputData, client);
    if (existingStudyId) {
      const queryResult = await client.query(
        "UPDATE hat.atlases SET source_studies=source_studies||$1 WHERE id=$2 AND NOT source_studies @> $1",
        [JSON.stringify([existingStudyId]), atlasId]
      );
      if (queryResult.rowCount === 0)
        throw new ValidationError(
          "DOI already exists in this atlas",
          undefined,
          "doi"
        );
      const existingStudy = await getSourceStudy(
        atlasId,
        existingStudyId,
        client
      );
      await updateSourceStudyValidations(existingStudy, client);
      await client.query("COMMIT");
      return existingStudy;
    }
    // Add the new source study
    const newInfo = await sourceStudyInputDataToDbData(inputData);
    const insertResult = await client.query<HCAAtlasTrackerDBSourceStudy>(
      "INSERT INTO hat.source_studies (doi, study_info) VALUES ($1, $2) RETURNING *",
      [newInfo.doi, JSON.stringify(newInfo.study_info)]
    );
    const newStudyRow = insertResult.rows[0];
    // Update the atlas's list of source studies
    await client.query(
      "UPDATE hat.atlases SET source_studies=source_studies||$1 WHERE id=$2",
      [JSON.stringify([newStudyRow.id]), atlasId]
    );
    // Add source datasets and validations
    await updateSourceStudyCellxGeneDatasets(newStudyRow, client);
    await updateSourceStudyValidations(newStudyRow, client);
    const newStudy = await getSourceStudy(atlasId, newStudyRow.id, client);
    await client.query("COMMIT");
    return newStudy;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Get ID of existing source study matching values submitted to create a source study.
 * @param inputData - Source study creation values.
 * @param client - Postgres client.
 * @returns ID of existing source study, or null.
 */
async function getExistingStudyId(
  inputData: NewSourceStudyData,
  client: pg.PoolClient
): Promise<string | null> {
  if (!("doi" in inputData)) return null;
  const doi = normalizeDoi(inputData.doi);
  return (
    (
      await client.query<Pick<HCAAtlasTrackerDBSourceStudy, "id">>(
        "SELECT id FROM hat.source_studies WHERE doi=$1 OR study_info->'publication'->>'preprintOfDoi'=$1 OR study_info->'publication'->>'hasPreprintDoi'=$1",
        [doi]
      )
    ).rows[0]?.id ?? null
  );
}

/**
 * Update a published or unpublished source study.
 * @param atlasId - Atlas that the source study is accessed through.
 * @param sourceStudyId - Source study to update.
 * @param inputData - Values to update the source study with.
 * @returns database model of updated source study.
 */
export async function updateSourceStudy(
  atlasId: string,
  sourceStudyId: string,
  inputData: SourceStudyEditData
): Promise<HCAAtlasTrackerDBSourceStudyWithSourceDatasets> {
  await confirmSourceStudyExistsOnAtlas(sourceStudyId, atlasId);

  const newInfo = await sourceStudyInputDataToDbData(inputData);

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");

    const queryResult = await client.query<HCAAtlasTrackerDBSourceStudy>(
      "UPDATE hat.source_studies SET doi=$1, study_info=$2 WHERE id=$3 RETURNING *",
      [newInfo.doi, JSON.stringify(newInfo.study_info), sourceStudyId]
    );

    if (queryResult.rows.length === 0)
      throw new NotFoundError(
        `Source study with ID ${sourceStudyId} doesn't exist`
      );

    const updatedStudyRow = queryResult.rows[0];

    await updateSourceStudyCellxGeneDatasets(updatedStudyRow, client);
    await updateSourceStudyValidations(updatedStudyRow, client);

    const updatedStudy = await getSourceStudy(atlasId, sourceStudyId, client);

    await client.query("COMMIT");

    return updatedStudy;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Derive source study information from input values.
 * @param inputData - Values to derive source study from.
 * @returns database model of values needed to define a source study.
 */
async function sourceStudyInputDataToDbData(
  inputData: NewSourceStudyData | SourceStudyEditData
): Promise<HCAAtlasTrackerDBSourceStudyMinimumColumns> {
  return "doi" in inputData
    ? await makePublishedSourceStudyDbData(inputData)
    : makeUnpublishedSourceStudyDbData(inputData);
}

/**
 * Derive published source study information from input values.
 * @param inputData - Values to derive source study from.
 * @returns database model of values needed to define a source study.
 */
async function makePublishedSourceStudyDbData(
  inputData: NewPublishedSourceStudyData | PublishedSourceStudyEditData
): Promise<HCAAtlasTrackerDBSourceStudyMinimumColumns> {
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

  const dois = getPublicationDois(doi, publication);

  const hcaProjectId = getProjectIdByDoi(dois);

  const cellxgeneCollectionId = getCellxGeneIdByDoi(dois);

  return {
    doi,
    study_info: {
      capId: "capId" in inputData ? inputData.capId : null,
      cellxgeneCollectionId,
      doiStatus: publication ? DOI_STATUS.OK : DOI_STATUS.DOI_NOT_ON_CROSSREF,
      hcaProjectId,
      publication,
      unpublishedInfo: null,
    },
  };
}

/**
 * Derive unpublished source study information from input values.
 * @param inputData - Values to derive source datstudyaset from.
 * @returns database model of values needed to define a source study.
 */
function makeUnpublishedSourceStudyDbData(
  inputData: NewUnpublishedSourceStudyData | UnpublishedSourceStudyEditData
): HCAAtlasTrackerDBSourceStudyMinimumColumns {
  return {
    doi: null,
    study_info: {
      capId: null,
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
 * Remove the specified source study from the specified atlas, and delete the source study if it's not contained in any other atlases.
 * @param atlasId - Atlas ID.
 * @param sourceStudyId - Source study ID.
 */
export async function deleteAtlasSourceStudy(
  atlasId: string,
  sourceStudyId: string
): Promise<void> {
  await confirmSourceStudyExistsOnAtlas(sourceStudyId, atlasId);

  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    await client.query(
      "UPDATE hat.atlases SET source_studies=source_studies-$1 WHERE id=$2",
      [sourceStudyId, atlasId]
    );
    const sourceStudyHasAtlases = (
      await client.query(
        "SELECT EXISTS(SELECT 1 FROM hat.atlases WHERE source_studies @> $1)",
        [JSON.stringify(sourceStudyId)]
      )
    ).rows[0].exists;
    if (sourceStudyHasAtlases) {
      await updateSourceStudyValidationsByEntityId(sourceStudyId, client);
    } else {
      await client.query(
        "DELETE FROM hat.source_datasets WHERE source_study_id=$1",
        [sourceStudyId]
      );
      await client.query("DELETE FROM hat.source_studies WHERE id=$1", [
        sourceStudyId,
      ]);
      await client.query("DELETE FROM hat.validations WHERE entity_id=$1", [
        sourceStudyId,
      ]);
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Read all source studies and update their HCA project IDs and CELLxGENE collection IDs as necessary.
 */
export async function updateSourceStudyExternalIds(): Promise<void> {
  const existingPublishedSourceStudies = (
    await query<HCAAtlasTrackerDBPublishedSourceStudy>(
      "SELECT * FROM hat.source_studies WHERE NOT doi IS NULL"
    )
  ).rows;

  for (const sourceStudy of existingPublishedSourceStudies) {
    const dois = getPublicationDois(
      sourceStudy.doi,
      sourceStudy.study_info.publication
    );
    const newHcaProjectId = getProjectIdByDoi(dois);
    const newCellxGeneCollectionId = getCellxGeneIdByDoi(dois);

    const updatedFields: Partial<HCAAtlasTrackerDBPublishedSourceStudyInfo> =
      {};
    let shouldUpdate = false;

    if (
      newHcaProjectId !== null &&
      newHcaProjectId !== sourceStudy.study_info.hcaProjectId
    ) {
      updatedFields.hcaProjectId = newHcaProjectId;
      shouldUpdate = true;
    }

    if (
      newCellxGeneCollectionId !== sourceStudy.study_info.cellxgeneCollectionId
    ) {
      updatedFields.cellxgeneCollectionId = newCellxGeneCollectionId;
      shouldUpdate = true;
    }

    if (shouldUpdate)
      await query(
        "UPDATE hat.source_studies SET study_info=study_info||$1 WHERE id=$2",
        [JSON.stringify(updatedFields), sourceStudy.id]
      );
  }
}

/**
 * Update validations for the source study with the given ID.
 * @param entityId - Source study ID.
 * @param client - Postgres client to use.
 */
export async function updateSourceStudyValidationsByEntityId(
  entityId: string,
  client: pg.PoolClient
): Promise<void> {
  const sourceStudy = (
    await client.query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies WHERE id=$1",
      [entityId]
    )
  ).rows[0];
  if (!sourceStudy)
    throw new NotFoundError(`Source study with ID ${entityId} doesn't exist`);
  await updateSourceStudyValidations(sourceStudy, client);
}

/**
 * Throw an error if the given source study doesn't exist on the given atlas.
 * @param sourceStudyId - Source study ID.
 * @param atlasId - Atlas ID.
 * @param limitToStatuses - If specified, statuses that the atlas must have.
 * @param client - Postgres client to use.
 */
export async function confirmSourceStudyExistsOnAtlas(
  sourceStudyId: string,
  atlasId: string,
  limitToStatuses?: ATLAS_STATUS[],
  client?: pg.PoolClient
): Promise<void> {
  const queryResult = await query<
    Pick<HCAAtlasTrackerDBAtlas, "source_studies" | "status">
  >(
    "SELECT source_studies, status FROM hat.atlases WHERE id=$1",
    [atlasId],
    client
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);
  const { source_studies, status } = queryResult.rows[0];
  if (limitToStatuses && !limitToStatuses.includes(status))
    throw new AccessError(`Can't access atlas with ID ${atlasId}`);
  if (!source_studies.includes(sourceStudyId))
    throw new NotFoundError(
      `Source study with ID ${sourceStudyId} doesn't exist on atlas with ID ${atlasId}`
    );
}
