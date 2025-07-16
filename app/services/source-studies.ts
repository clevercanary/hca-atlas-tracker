import pg from "pg";
import { ValidationError } from "yup";
import {
  ATLAS_STATUS,
  DOI_STATUS,
  GoogleSheetInfo,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBPublishedSourceStudy,
  HCAAtlasTrackerDBPublishedSourceStudyInfo,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerDBSourceStudyMinimumColumns,
  HCAAtlasTrackerDBSourceStudyWithAtlasProperties,
  HCAAtlasTrackerDBSourceStudyWithRelatedEntities,
  HCAAtlasTrackerDBSourceStudyWithSourceDatasets,
  HCAAtlasTrackerDBValidation,
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
import {
  AccessError,
  InvalidOperationError,
  NotFoundError,
} from "../utils/api-handler";
import { getCrossrefPublicationInfo } from "../utils/crossref/crossref";
import { normalizeDoi } from "../utils/doi";
import {
  getSheetTitleForApi,
  getSpreadsheetIdFromUrl,
} from "../utils/google-sheets";
import { getBaseModelAtlas } from "./atlases";
import { getCellxGeneIdByDoi } from "./cellxgene";
import {
  doOrContinueTransaction,
  doTransaction,
  getPoolClient,
  query,
} from "./database";
import {
  deleteEntrySheetValidationsOfDeletedSourceStudy,
  EntrySheetValidationUpdateParameters,
  startEntrySheetValidationsUpdate,
} from "./entry-sheets";
import { getProjectIdByDoi } from "./hca-projects";
import {
  deleteSourceDatasetsOfDeletedSourceStudy,
  updateSourceStudyCellxGeneDatasets,
} from "./source-datasets";
import {
  getValidationRecordsWithoutAtlasPropertiesForEntities,
  updateSourceStudyValidations,
} from "./validations";

export async function getAtlasSourceStudies(
  atlasId: string
): Promise<HCAAtlasTrackerDBSourceStudyWithRelatedEntities[]> {
  return await doTransaction(async (client) => {
    const {
      rows: [atlas],
    } = await query<Pick<HCAAtlasTrackerDBAtlas, "source_studies">>(
      "SELECT source_studies FROM hat.atlases WHERE id=$1",
      [atlasId]
    );

    if (!atlas) {
      throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);
    }

    const sourceStudies =
      atlas.source_studies.length === 0
        ? []
        : (
            await query<HCAAtlasTrackerDBSourceStudyWithSourceDatasets>(
              "SELECT s.*, COUNT(d.*)::int AS source_dataset_count FROM hat.source_studies s LEFT JOIN hat.source_datasets d ON d.source_study_id=s.id WHERE s.id=ANY($1) GROUP BY s.id",
              [atlas.source_studies]
            )
          ).rows;

    return await addValidationsToSourceStudiesInfo(sourceStudies, client);
  });
}

export async function getBaseModelAtlasSourceStudies(
  atlasId: string
): Promise<HCAAtlasTrackerDBSourceStudy[]> {
  return await getBaseModelSourceStudies(
    (
      await getBaseModelAtlas(atlasId)
    ).source_studies
  );
}

export async function getBaseModelSourceStudies(
  sourceStudyIds: string[]
): Promise<HCAAtlasTrackerDBSourceStudy[]> {
  const { rows: sourceStudies } = await query<HCAAtlasTrackerDBSourceStudy>(
    "SELECT * FROM hat.source_studies WHERE id=ANY($1)",
    [sourceStudyIds]
  );

  const presentIds = new Set(sourceStudies.map((study) => study.id));
  const missingIds = sourceStudyIds.filter((id) => !presentIds.has(id));
  if (missingIds.length > 0)
    throw new NotFoundError(
      `Source studies don't exist with IDs: ${missingIds.join(", ")}`
    );

  return sourceStudies;
}

export async function getSourceStudy(
  atlasId: string,
  sourceStudyId: string,
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBSourceStudyWithRelatedEntities> {
  return await doOrContinueTransaction(client, async (client) => {
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

    return (
      await addValidationsToSourceStudiesInfo(queryResult.rows, client)
    )[0];
  });
}

/**
 * Take an array of source studies, get the validation records for those source studies, and return the source studies with validation records added.
 * @param sourceStudies - Source studies to get validations for.
 * @param client - Postgres client to use.
 * @returns sources studies with validation lists added.
 */
async function addValidationsToSourceStudiesInfo(
  sourceStudies: HCAAtlasTrackerDBSourceStudyWithSourceDatasets[],
  client: pg.PoolClient
): Promise<HCAAtlasTrackerDBSourceStudyWithRelatedEntities[]> {
  const validations =
    await getValidationRecordsWithoutAtlasPropertiesForEntities(
      sourceStudies.map((s) => s.id),
      client
    );
  const validationsBySourceStudyId = new Map<
    string,
    HCAAtlasTrackerDBValidation[]
  >();
  for (const validation of validations) {
    let studyValidations = validationsBySourceStudyId.get(validation.entity_id);
    if (!studyValidations)
      validationsBySourceStudyId.set(
        validation.entity_id,
        (studyValidations = [])
      );
    studyValidations.push(validation);
  }
  return sourceStudies.map((sourceStudy) => ({
    ...sourceStudy,
    validations: validationsBySourceStudyId.get(sourceStudy.id) ?? [],
  }));
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
): Promise<HCAAtlasTrackerDBSourceStudyWithRelatedEntities> {
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
      await updateSourceStudyValidationsByEntityId(existingStudyId, client);
      const existingStudy = await getSourceStudy(
        atlasId,
        existingStudyId,
        client
      );
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
    await updateSourceStudyValidationsByEntityId(newStudyRow.id, client);
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
 * Get all source studies that have any of the specified DOIs.
 * @param dois - DOIs to get source studies of.
 * @param client - Postgres client.
 * @returns source studies.
 */
export async function getSourceStudiesByDois(
  dois: string[],
  client: pg.PoolClient
): Promise<HCAAtlasTrackerDBSourceStudy[]> {
  return (
    await client.query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies WHERE doi=ANY($1) OR study_info->'publication'->>'preprintOfDoi'=ANY($1) OR study_info->'publication'->>'hasPreprintDoi'=ANY($1)",
      [dois]
    )
  ).rows;
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
): Promise<HCAAtlasTrackerDBSourceStudyWithRelatedEntities> {
  const atlas = await getConfirmedSourceStudyAtlas(sourceStudyId, atlasId);
  const [existingSourceStudy] = await getBaseModelSourceStudies([
    sourceStudyId,
  ]);
  const existingEntrySheetIds = new Set(
    existingSourceStudy.study_info.metadataSpreadsheets.map(({ url }) =>
      getSpreadsheetIdFromUrl(url)
    )
  );

  const newInfo = await sourceStudyInputDataToDbData(inputData);

  const newEntrySheetsInfo: EntrySheetValidationUpdateParameters[] = [];
  for (const { url } of newInfo.study_info.metadataSpreadsheets) {
    const spreadsheetId = getSpreadsheetIdFromUrl(url);
    if (!existingEntrySheetIds.has(spreadsheetId)) {
      newEntrySheetsInfo.push({
        bioNetwork: atlas.overview.network,
        sourceStudyId,
        spreadsheetId,
      });
    }
  }

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
    await updateSourceStudyValidationsByEntityId(sourceStudyId, client);

    const updatedStudy = await getSourceStudy(atlasId, sourceStudyId, client);

    await client.query("COMMIT");

    // Start entry sheet validations update without waiting for any errors
    if (newEntrySheetsInfo.length > 0) {
      startEntrySheetValidationsUpdate(newEntrySheetsInfo).catch((err) =>
        console.error(err)
      );
    }

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
    : await makeUnpublishedSourceStudyDbData(inputData);
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
      capId: ("capId" in inputData && inputData.capId) || null,
      cellxgeneCollectionId,
      doiStatus: publication ? DOI_STATUS.OK : DOI_STATUS.DOI_NOT_ON_CROSSREF,
      hcaProjectId,
      metadataSpreadsheets: await getMetadataSpreadsheetsInfo(inputData),
      publication,
      unpublishedInfo: null,
    },
  };
}

/**
 * Derive unpublished source study information from input values.
 * @param inputData - Values to derive source study from.
 * @returns database model of values needed to define a source study.
 */
async function makeUnpublishedSourceStudyDbData(
  inputData: NewUnpublishedSourceStudyData | UnpublishedSourceStudyEditData
): Promise<HCAAtlasTrackerDBSourceStudyMinimumColumns> {
  const externalIds =
    "capId" in inputData
      ? {
          capId: inputData.capId || null,
          cellxgeneCollectionId: inputData.cellxgeneCollectionId || null,
          hcaProjectId: inputData.hcaProjectId || null,
        }
      : {
          capId: null,
          cellxgeneCollectionId: null,
          hcaProjectId: null,
        };
  return {
    doi: null,
    study_info: {
      doiStatus: DOI_STATUS.NA,
      metadataSpreadsheets: await getMetadataSpreadsheetsInfo(inputData),
      publication: null,
      unpublishedInfo: {
        contactEmail: inputData.contactEmail,
        referenceAuthor: inputData.referenceAuthor,
        title: inputData.title,
      },
      ...externalIds,
    },
  };
}

/**
 * Get info objects for the metadata spreadsheet URLs specified in the given input data, or empty array if none are specified.
 * @param inputData - Source study input data to get metadata spreadsheet URLs from.
 * @returns metadata spreadsheets info.
 */
async function getMetadataSpreadsheetsInfo(
  inputData:
    | NewPublishedSourceStudyData
    | PublishedSourceStudyEditData
    | NewUnpublishedSourceStudyData
    | UnpublishedSourceStudyEditData
): Promise<GoogleSheetInfo[]> {
  if ("metadataSpreadsheets" in inputData) {
    const info: GoogleSheetInfo[] = [];
    for (const [i, { url }] of inputData.metadataSpreadsheets.entries()) {
      info.push({
        title: await getSheetTitleForApi(url, `metadataSpreadsheets.${i}.url`),
        url,
      });
    }
    return info;
  } else {
    return [];
  }
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
  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    await confirmSourceStudyCanBeDeletedFromAtlas(
      sourceStudyId,
      atlasId,
      client
    );
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
      await deleteSourceDatasetsOfDeletedSourceStudy(sourceStudyId, client);
      await deleteEntrySheetValidationsOfDeletedSourceStudy(
        sourceStudyId,
        client
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
  await updateSourceStudyValidations(
    await getSourceStudyWithAtlasProperties(entityId, client),
    client
  );
}

/**
 * Get all source studies, with properties of their atlases added.
 * @param client - Postgres client to use.
 * @returns source studies with atlas properties.
 */
export async function getSourceStudiesWithAtlasProperties(
  client: pg.PoolClient
): Promise<HCAAtlasTrackerDBSourceStudyWithAtlasProperties[]> {
  const queryResult =
    await client.query<HCAAtlasTrackerDBSourceStudyWithAtlasProperties>(`
      SELECT
        s.*,
        ARRAY_AGG(DISTINCT concat(a.overview->>'shortName', ' v', a.overview->>'version')) AS atlas_names,
        ARRAY_AGG(DISTINCT a.overview->>'shortName') AS atlas_short_names,
        ARRAY_AGG(DISTINCT a.overview->>'version') AS atlas_versions,
        ARRAY_AGG(DISTINCT a.overview->>'network') AS networks
      FROM hat.source_studies s
      LEFT JOIN hat.atlases a ON a.source_studies @> to_jsonb(s.id)
      GROUP BY s.id
    `);
  return queryResult.rows;
}

/**
 * Get a specified source study, with properties of its atlases added.
 * @param sourceStudyId - ID of the soruce study to get.
 * @param client - Postgres client to use.
 * @returns source studies with atlas properties.
 */
export async function getSourceStudyWithAtlasProperties(
  sourceStudyId: string,
  client: pg.PoolClient
): Promise<HCAAtlasTrackerDBSourceStudyWithAtlasProperties> {
  const queryResult =
    await client.query<HCAAtlasTrackerDBSourceStudyWithAtlasProperties>(
      `
        SELECT
          s.*,
          ARRAY_AGG(DISTINCT concat(a.overview->>'shortName', ' v', a.overview->>'version')) AS atlas_names,
          ARRAY_AGG(DISTINCT a.overview->>'shortName') AS atlas_short_names,
          ARRAY_AGG(DISTINCT a.overview->>'version') AS atlas_versions,
          ARRAY_AGG(DISTINCT a.overview->>'network') AS networks
        FROM hat.source_studies s
        LEFT JOIN hat.atlases a ON a.source_studies @> to_jsonb(s.id)
        WHERE s.id=$1
        GROUP BY s.id
      `,
      [sourceStudyId]
    );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(
      `Source study with ID ${sourceStudyId} doesn't exist`
    );
  return queryResult.rows[0];
}

/**
 * Get all source studies that have CELLxGENE IDs.
 * @returns source studies.
 */
export async function getCellxGeneSourceStudies(): Promise<
  HCAAtlasTrackerDBSourceStudy[]
> {
  const queryResult = await query<HCAAtlasTrackerDBSourceStudy>(
    "SELECT * FROM hat.source_studies s WHERE NOT s.study_info->'cellxgeneCollectionId' = 'null'"
  );
  return queryResult.rows;
}

/**
 * Throw an error if the given source study cannot be deleted from the given atlas.
 * @param sourceStudyId - Source study ID.
 * @param atlasId - Atlas ID.
 * @param client - Postgres client to use.
 */
async function confirmSourceStudyCanBeDeletedFromAtlas(
  sourceStudyId: string,
  atlasId: string,
  client: pg.PoolClient
): Promise<void> {
  await confirmSourceStudyExistsOnAtlas(
    sourceStudyId,
    atlasId,
    undefined,
    client
  );

  const datasetsQueryResult = await query(
    `
      SELECT
        EXISTS(
          SELECT 1 FROM hat.source_datasets d
          WHERE d.id = ANY(a.source_datasets) AND d.source_study_id = $1
        )
      FROM hat.atlases a
      WHERE a.id = $2
    `,
    [sourceStudyId, atlasId],
    client
  );
  if (datasetsQueryResult.rows[0].exists)
    throw new InvalidOperationError(
      `Source study with ID ${sourceStudyId} has dataset(s) linked to atlas with ID ${atlasId}`
    );
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
  await getConfirmedSourceStudyAtlas(
    sourceStudyId,
    atlasId,
    limitToStatuses,
    client
  );
}

/**
 * Get the core database model of the given atlas, confirming that it contains the given source study and throwing an error otherwise.
 * @param sourceStudyId - Source study ID.
 * @param atlasId - Atlas ID.
 * @param limitToStatuses - If specified, statuses that the atlas must have.
 * @param client - Postgres client to use.
 * @returns atlas.
 */
async function getConfirmedSourceStudyAtlas(
  sourceStudyId: string,
  atlasId: string,
  limitToStatuses?: ATLAS_STATUS[],
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBAtlas> {
  const queryResult = await query<HCAAtlasTrackerDBAtlas>(
    "SELECT * FROM hat.atlases WHERE id=$1",
    [atlasId],
    client
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);
  const atlas = queryResult.rows[0];
  if (limitToStatuses && !limitToStatuses.includes(atlas.status))
    throw new AccessError(`Can't access atlas with ID ${atlasId}`);
  if (!atlas.source_studies.includes(sourceStudyId))
    throw new NotFoundError(
      `Source study with ID ${sourceStudyId} doesn't exist on atlas with ID ${atlasId}`
    );
  return atlas;
}
