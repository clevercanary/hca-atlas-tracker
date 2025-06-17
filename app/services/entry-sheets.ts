import { getSpreadsheetIdFromUrl } from "app/utils/google-sheets";
import { validateEntrySheet } from "app/utils/hca-validation-tools";
import {
  HCAAtlasTrackerDBEntrySheetValidation,
  HCAAtlasTrackerDBEntrySheetValidationListFields,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { doTransaction, query } from "./database";
import { getBaseModelAtlasSourceStudies } from "./source-studies";

interface CompletionPromiseContainer {
  completionPromise: Promise<void>;
}

type ValidationUpdateData = Omit<HCAAtlasTrackerDBEntrySheetValidation, "id">;

export async function getAtlasEntrySheetValidations(
  atlasId: string
): Promise<HCAAtlasTrackerDBEntrySheetValidationListFields[]> {
  const sourceStudies = await getBaseModelAtlasSourceStudies(atlasId);
  const validationsResult =
    await query<HCAAtlasTrackerDBEntrySheetValidationListFields>(
      `
        SELECT
          entry_sheet_id,
          entry_sheet_title,
          id,
          last_synced,
          last_updated,
          source_study_id,
          validation_summary
        FROM hat.entry_sheet_validations
        WHERE source_study_id=ANY($1)
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
  const sourceStudies = await getBaseModelAtlasSourceStudies(atlasId);

  const validationResultPromises: Promise<ValidationUpdateData>[] =
    sourceStudies
      .map((study) =>
        study.study_info.metadataSpreadsheets.map((sheetInfo) =>
          getSheetValidationResults(
            study.id,
            getSpreadsheetIdFromUrl(sheetInfo.url)
          )
        )
      )
      .flat();

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
    const updatedValidations: ValidationUpdateData[] = [];
    const newValidations: ValidationUpdateData[] = [];
    for (const validation of validations) {
      if (existingValidationSheetIds.includes(validation.entry_sheet_id))
        updatedValidations.push(validation);
      else newValidations.push(validation);
    }
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
  });
}

async function getSheetValidationResults(
  sourceStudyId: string,
  sheetId: string
): Promise<ValidationUpdateData> {
  const syncTime = new Date();
  try {
    const response = await validateEntrySheet(sheetId);
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
    return makeValidationWithErrorMessage(
      String(err),
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
