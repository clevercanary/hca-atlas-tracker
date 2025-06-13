import { getSpreadsheetIdFromUrl } from "app/utils/google-sheets";
import { validateEntrySheet } from "app/utils/hca-validation-tools";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBEntrySheetValidation,
  HCAAtlasTrackerDBSourceStudy,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { NotFoundError } from "../utils/api-handler";
import { doTransaction, query } from "./database";

type ValidationUpdateData = Omit<HCAAtlasTrackerDBEntrySheetValidation, "id">;

export async function updateAtlasEntrySheetValidations(
  atlasId: string
): Promise<void> {
  const atlasResult = await query<
    Pick<HCAAtlasTrackerDBAtlas, "source_studies">
  >("SELECT source_studies FROM hat.atlases WHERE id=$1", [atlasId]);

  if (atlasResult.rows.length === 0)
    throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);

  const sourceStudyIds = atlasResult.rows[0].source_studies;

  const studiesResult = await query<HCAAtlasTrackerDBSourceStudy>(
    "SELECT * FROM hat.source_studies WHERE id=ANY($1)",
    [sourceStudyIds]
  );

  const validationResults = await Promise.allSettled(
    studiesResult.rows
      .map((study) =>
        study.study_info.metadataSpreadsheets.map((sheetInfo) =>
          getSheetValidationResults(atlasId, study.id, sheetInfo.url)
        )
      )
      .flat()
  );

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
      Pick<HCAAtlasTrackerDBEntrySheetValidation, "id">
    >(
      "SELECT id FROM hat.entry_sheet_validations WHERE entry_sheet_id=ANY($1)",
      [sheetIds],
      client
    );
    const existingValidationSheetIds = existingValidationsResult.rows.map(
      (v) => v.id
    );
    const updatedValidations: ValidationUpdateData[] = [];
    const newValidations: ValidationUpdateData[] = [];
    for (const validation of validations) {
      if (existingValidationSheetIds.includes(validation.entry_sheet_id))
        updatedValidations.push(validation);
      else newValidations.push(validation);
    }
    // TODO is entry sheet ID what these should be joined on? are there any uniqueness considerations here or for the query above?
    await query(
      `
        UPDATE hat.entry_sheet_validations v
        SET
          entry_sheet_title = u.entry_sheet_title
          last_synced = u.last_synced
          last_updated = u.last_updated
          validation_report = u.validation_report
          validation_summary = u.validation_summary
        FROM jsonb_to_recordset($1) as u(
          atlas_id uuid,
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
    await query(
      `
        INSERT INTO hat.entry_sheet_validations
        SELECT * FROM jsonb_to_recordset($1) as u(
          atlas_id uuid,
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
  atlasId: string,
  sourceStudyId: string,
  sheetUrl: string
): Promise<ValidationUpdateData> {
  const sheetId = getSpreadsheetIdFromUrl(sheetUrl);
  const syncTime = new Date().toISOString();
  try {
    const response = await validateEntrySheet(sheetId);
    if ("error" in response) {
      return makeValidationWithErrorMessage(
        response.error,
        atlasId,
        sourceStudyId,
        sheetId,
        syncTime
      );
    } else {
      return {
        atlas_id: atlasId,
        entry_sheet_id: sheetId,
        entry_sheet_title: response.sheet_title,
        last_synced: syncTime,
        last_updated: response.last_updated,
        source_study_id: sourceStudyId,
        validation_report: response.errors,
        validation_summary: response.summary,
      };
    }
  } catch (err) {
    console.error(err);
    return makeValidationWithErrorMessage(
      String(err),
      atlasId,
      sourceStudyId,
      sheetId,
      syncTime
    );
  }
}

function makeValidationWithErrorMessage(
  message: string,
  atlasId: string,
  sourceStudyId: string,
  entrySheetId: string,
  syncTime: string
): ValidationUpdateData {
  return {
    atlas_id: atlasId,
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
    validation_summary: null,
  };
}
