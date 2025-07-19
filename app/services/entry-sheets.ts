import pg from "pg";
import { ValidationError } from "yup";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBEntrySheetValidation,
  HCAAtlasTrackerDBEntrySheetValidationListFields,
  NetworkKey,
  WithSourceStudyInfo,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { NotFoundError } from "../utils/api-handler";
import { validateEntrySheet } from "../utils/hca-validation-tools/hca-validation-tools";
import { getBaseModelAtlas } from "./atlases";
import { doTransaction, query } from "./database";
import {
  getBaseModelAtlasSourceStudies,
  getBaseModelSourceStudies,
} from "./source-studies";

export interface EntrySheetValidationUpdateParameters {
  bioNetwork: NetworkKey;
  sourceStudyId: string;
  spreadsheetId: string;
}

interface CompletionPromiseContainer {
  completionPromise: Promise<void>;
}

type ValidationUpdateData = Omit<HCAAtlasTrackerDBEntrySheetValidation, "id">;

export async function getEntrySheetValidation(
  atlasId: string,
  entrySheetValidationId: string
): Promise<WithSourceStudyInfo<HCAAtlasTrackerDBEntrySheetValidation>> {
  const atlasResult = await query<
    Pick<HCAAtlasTrackerDBAtlas, "source_studies">
  >("SELECT source_studies FROM hat.atlases WHERE id=$1", [atlasId]);
  if (atlasResult.rows.length === 0)
    throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);
  const atlasSourceStudies = atlasResult.rows[0].source_studies;
  const validationResult = await query<
    WithSourceStudyInfo<HCAAtlasTrackerDBEntrySheetValidation>
  >(
    `
      SELECT
        v.*,
        s.doi,
        s.study_info
      FROM hat.entry_sheet_validations v
      LEFT JOIN hat.source_studies s ON v.source_study_id=s.id
      WHERE v.source_study_id=ANY($1) AND v.id=$2
    `,
    [atlasSourceStudies, entrySheetValidationId]
  );
  if (validationResult.rows.length === 0)
    throw new NotFoundError(
      `Entry sheet validation with ID ${entrySheetValidationId} doesn't exist on atlas with ID ${atlasId}`
    );
  return validationResult.rows[0];
}

export async function getAtlasEntrySheetValidations(
  atlasId: string
): Promise<
  WithSourceStudyInfo<HCAAtlasTrackerDBEntrySheetValidationListFields>[]
> {
  const sourceStudies = await getBaseModelAtlasSourceStudies(atlasId);
  const validationsResult = await query<
    WithSourceStudyInfo<HCAAtlasTrackerDBEntrySheetValidationListFields>
  >(
    `
        SELECT
          v.entry_sheet_id,
          v.entry_sheet_title,
          v.id,
          v.last_synced,
          v.last_updated,
          v.source_study_id,
          v.validation_summary,
          s.doi,
          s.study_info
        FROM hat.entry_sheet_validations v
        LEFT JOIN hat.source_studies s ON v.source_study_id=s.id
        WHERE v.source_study_id=ANY($1)
      `,
    [sourceStudies.map((study) => study.id)]
  );
  return validationsResult.rows;
}

/**
 * Update entry sheet validations for source studies of the given atlas, resolving the returned promise **before** receiving the validation API responses.
 * @param atlasId - Atlas to update entry sheet validations for.
 * @returns promise resolving to an object containing a promise that resolves when validations have been updated.
 */
export async function startAtlasEntrySheetValidationsUpdate(
  atlasId: string
): Promise<CompletionPromiseContainer> {
  const {
    overview: { network: bioNetwork },
    source_studies: sourceStudyIds,
  } = await getBaseModelAtlas(atlasId);

  const sourceStudies = await getBaseModelSourceStudies(sourceStudyIds);

  const entrySheetParams: EntrySheetValidationUpdateParameters[] = sourceStudies
    .map((study) =>
      study.study_info.metadataSpreadsheets.map((sheetInfo) => ({
        bioNetwork,
        sourceStudyId: study.id,
        spreadsheetId: sheetInfo.id,
      }))
    )
    .flat();

  return await startEntrySheetValidationsUpdate(entrySheetParams);
}

/**
 * Update the given entry sheet validation, resolving the returned promise **before** receiving the validation API responses.
 * @param atlasId - Atlas that the entry sheet validation is accessed via.
 * @param entrySheetValidationId - Entry sheet validation to update.
 * @returns promise resolving to an object containing a promise that resolves when the validation has been updated.
 */
export async function startUpdateForEntrySheetValidation(
  atlasId: string,
  entrySheetValidationId: string
): Promise<CompletionPromiseContainer> {
  const atlas = await getBaseModelAtlas(atlasId);

  const existingValidationResult = await query<
    Pick<
      HCAAtlasTrackerDBEntrySheetValidation,
      "source_study_id" | "entry_sheet_id"
    >
  >(
    "SELECT source_study_id, entry_sheet_id FROM hat.entry_sheet_validations WHERE id=$1",
    [entrySheetValidationId]
  );
  if (existingValidationResult.rows.length === 0)
    throw new NotFoundError(
      `Entry sheet validation with ID ${entrySheetValidationId} doesn't exist`
    );
  const { entry_sheet_id: spreadsheetId, source_study_id: sourceStudyId } =
    existingValidationResult.rows[0];

  if (!atlas.source_studies.includes(sourceStudyId))
    throw new NotFoundError(
      `Entry sheet validation with ID ${entrySheetValidationId} doesn't exist on atlas with ID ${atlasId}`
    );

  return await startEntrySheetValidationsUpdate([
    { bioNetwork: atlas.overview.network, sourceStudyId, spreadsheetId },
  ]);
}

/**
 * Update validations for the given entry sheets, resolving the returned promise **before** receiving the validation API responses.
 * @param entrySheetParams - For each entry sheet to validate, an object specifying info necessary to perform the validation and save the result.
 * @returns promise resolving to an object containing a promise that resolves when validations have been updated.
 */
export async function startEntrySheetValidationsUpdate(
  entrySheetParams: EntrySheetValidationUpdateParameters[]
): Promise<CompletionPromiseContainer> {
  const validationResultPromises = entrySheetParams.map((sheet) =>
    getSheetValidationResults(
      sheet.sourceStudyId,
      sheet.spreadsheetId,
      sheet.bioNetwork
    )
  );

  return {
    completionPromise: updateEntrySheetValidationsFromResultPromises(
      validationResultPromises
    ),
  };
}

export async function updateEntrySheetValidationsFromResultPromises(
  resultPromises: Promise<ValidationUpdateData>[]
): Promise<void> {
  const validationResults = await Promise.allSettled(resultPromises);

  const validations: ValidationUpdateData[] = [];
  for (const responseResult of validationResults) {
    if (responseResult.status === "fulfilled") {
      validations.push(responseResult.value);
    } else {
      console.error(responseResult.reason);
    }
  }

  await doTransaction(async (client) => {
    // Determine which entry sheets still exist
    const sourceStudyIds = new Set(validations.map((v) => v.source_study_id));
    const studiesSheetsResult = await query<{ id: string }>(
      `
        SELECT jsonb_array_elements(study_info -> 'metadataSpreadsheets') ->> 'id' AS id
        FROM hat.source_studies s
        WHERE s.id = ANY($1)
      `,
      [Array.from(sourceStudyIds)],
      client
    );
    const studiesSheetIds = new Set(
      studiesSheetsResult.rows.map(({ id }) => id)
    );
    const validationsToKeep = validations.filter((v) =>
      studiesSheetIds.has(v.entry_sheet_id)
    );

    // If none are present, return early
    if (validationsToKeep.length === 0) return;

    // Create and update validations
    await createAndUpdateEntrySheetValidations(validationsToKeep, client);
  });
}

async function createAndUpdateEntrySheetValidations(
  validations: ValidationUpdateData[],
  client: pg.PoolClient
): Promise<void> {
  // Get existing entry sheet validations
  const sheetIds = validations.map((v) => v.entry_sheet_id);
  const existingValidationsResult = await query<
    Pick<HCAAtlasTrackerDBEntrySheetValidation, "entry_sheet_id">
  >(
    "SELECT entry_sheet_id FROM hat.entry_sheet_validations WHERE entry_sheet_id=ANY($1)",
    [sheetIds],
    client
  );
  const existingValidationSheetIds = existingValidationsResult.rows.map(
    (v) => v.entry_sheet_id
  );

  // Split validations into new and updated
  const updatedValidations: ValidationUpdateData[] = [];
  const newValidations: ValidationUpdateData[] = [];
  for (const validation of validations) {
    if (existingValidationSheetIds.includes(validation.entry_sheet_id))
      updatedValidations.push(validation);
    else newValidations.push(validation);
  }

  // Update and create validations as appropriate
  if (updatedValidations.length)
    await query(
      `
        UPDATE hat.entry_sheet_validations v
        SET
          entry_sheet_title = u.entry_sheet_title,
          last_synced = u.last_synced,
          last_updated = u.last_updated,
          validation_report = u.validation_report,
          validation_summary = u.validation_summary
        FROM jsonb_to_recordset($1) as u(
          entry_sheet_id text,
          entry_sheet_title text,
          last_synced timestamp,
          last_updated jsonb,
          source_study_id uuid,
          validation_report jsonb,
          validation_summary jsonb
        )
        WHERE v.entry_sheet_id = u.entry_sheet_id
      `,
      [JSON.stringify(updatedValidations)],
      client
    );
  if (newValidations.length)
    await query(
      `
        INSERT INTO hat.entry_sheet_validations (
          entry_sheet_id, entry_sheet_title, last_synced, last_updated, source_study_id, validation_report, validation_summary
        )
        SELECT * FROM jsonb_to_recordset($1) as u(
          entry_sheet_id text,
          entry_sheet_title text,
          last_synced timestamp,
          last_updated jsonb,
          source_study_id uuid,
          validation_report jsonb,
          validation_summary jsonb
        )
      `,
      [JSON.stringify(newValidations)],
      client
    );
}

export async function deleteEntrySheetValidationsBySpreadsheet(
  spreadsheetIds: string[],
  client: pg.PoolClient
): Promise<void> {
  await client.query(
    "DELETE FROM hat.entry_sheet_validations WHERE entry_sheet_id=ANY($1)",
    [spreadsheetIds]
  );
}

export async function deleteEntrySheetValidationsOfDeletedSourceStudy(
  sourceStudyId: string,
  client: pg.PoolClient
): Promise<void> {
  await client.query(
    "DELETE FROM hat.entry_sheet_validations WHERE source_study_id=$1",
    [sourceStudyId]
  );
}

async function getSheetValidationResults(
  sourceStudyId: string,
  sheetId: string,
  bioNetwork: NetworkKey
): Promise<ValidationUpdateData> {
  const syncTime = new Date();
  try {
    const response = await validateEntrySheet(sheetId, bioNetwork);
    if ("error" in response) {
      return makeValidationWithErrorMessage(
        response.error,
        sourceStudyId,
        sheetId,
        syncTime
      );
    } else {
      return {
        entry_sheet_id: sheetId,
        entry_sheet_title: response.sheet_title,
        last_synced: syncTime,
        last_updated: response.last_updated,
        source_study_id: sourceStudyId,
        validation_report: response.errors,
        validation_summary: response.summary ?? {
          dataset_count: null,
          donor_count: null,
          error_count: response.errors.length,
          sample_count: null,
        },
      };
    }
  } catch (err) {
    console.error(err);
    const message =
      err instanceof ValidationError
        ? `Received unexpected response format from HCA validation tools: ${err.message}`
        : String(err);
    return makeValidationWithErrorMessage(
      message,
      sourceStudyId,
      sheetId,
      syncTime
    );
  }
}

function makeValidationWithErrorMessage(
  message: string,
  sourceStudyId: string,
  entrySheetId: string,
  syncTime: Date
): ValidationUpdateData {
  return {
    entry_sheet_id: entrySheetId,
    entry_sheet_title: null,
    last_synced: syncTime,
    last_updated: null,
    source_study_id: sourceStudyId,
    validation_report: [
      {
        cell: null,
        column: null,
        entity_type: null,
        input: null,
        message,
        primary_key: null,
        row: null,
        worksheet_id: null,
      },
    ],
    validation_summary: {
      dataset_count: null,
      donor_count: null,
      error_count: 1,
      sample_count: null,
    },
  };
}
