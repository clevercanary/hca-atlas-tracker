import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBEntrySheetValidation,
  HCAAtlasTrackerDBEntrySheetValidationListFields,
  WithSourceStudyInfo,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { NotFoundError } from "../utils/api-handler";
import { getSpreadsheetIdFromUrl } from "../utils/google-sheets";
import { validateEntrySheet } from "../utils/hca-validation-tools/hca-validation-tools";
import { doTransaction, query } from "./database";
import { getBaseModelAtlasSourceStudies } from "./source-studies";

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
