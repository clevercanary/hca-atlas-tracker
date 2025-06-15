import { TEST_ENTRY_SHEET_VALIDATION_REPONSES_BY_ID } from "testing/constants";
import { expectIsDefined } from "../../../testing/utils";
import { EntrySheetValidationResponse } from "../hca-validation-tools";

export async function validateEntrySheet(
  googleSheetId: string
): Promise<EntrySheetValidationResponse> {
  const response =
    TEST_ENTRY_SHEET_VALIDATION_REPONSES_BY_ID.get(googleSheetId);
  if (!expectIsDefined(response))
    throw new Error(`Unknown test entry sheet ID: ${googleSheetId}`);
  return response;
}
