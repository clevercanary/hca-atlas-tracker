import {
  FETCH_ERROR_ENTRY_SHEET_IDS,
  TEST_ENTRY_SHEET_VALIDATION_FETCH_ERROR_MESSAGE,
  TEST_ENTRY_SHEET_VALIDATION_RESPONSES_BY_ID,
} from "testing/constants";
import { expectIsDefined } from "../../../../testing/utils";
import { EntrySheetValidationResponse } from "../hca-validation-tools";

export async function fetchEntrySheetValidationResults(
  googleSheetId: string,
): Promise<EntrySheetValidationResponse> {
  if (FETCH_ERROR_ENTRY_SHEET_IDS.has(googleSheetId))
    throw new Error(TEST_ENTRY_SHEET_VALIDATION_FETCH_ERROR_MESSAGE);
  const response =
    TEST_ENTRY_SHEET_VALIDATION_RESPONSES_BY_ID.get(googleSheetId);
  if (!expectIsDefined(response))
    throw new Error(`Unknown test entry sheet ID: ${googleSheetId}`);
  return response as EntrySheetValidationResponse;
}
