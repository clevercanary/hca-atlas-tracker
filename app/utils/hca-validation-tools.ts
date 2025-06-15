import { METHOD } from "../common/entities";

interface EntrySheetValidationRequestBody {
  sheet_id: string;
}

export type EntrySheetValidationResponse =
  | EntrySheetValidationResponseSuccess
  | EntrySheetValidationResponseError;

export interface EntrySheetValidationResponseSuccess {
  errors: EntrySheetValidationErrorInfo[];
  last_updated: GoogleLastUpdateInfo | null;
  sheet_title: string | null;
  summary: EntrySheetValidationSummary | null;
}

export interface EntrySheetValidationResponseError {
  error: string;
}

export interface GoogleLastUpdateInfo {
  by: string;
  by_email: string | null;
  date: string;
}

export interface EntrySheetValidationErrorInfo {
  cell: string | null;
  column: string | null;
  entity_type: string | null;
  input: string | null;
  message: string;
  primary_key: string | null;
  row: number | null;
  worksheet_id: string | null;
}

export interface EntrySheetValidationSummary {
  dataset_count: number;
  donor_count: number;
  error_count: number;
  sample_count: number;
}

const VALIDATION_API_URL = ""; // TODO

export async function validateEntrySheet(
  googleSheetId: string
): Promise<EntrySheetValidationResponse> {
  const body: EntrySheetValidationRequestBody = {
    sheet_id: googleSheetId,
  };
  return await (
    await fetch(VALIDATION_API_URL, {
      body: JSON.stringify(body),
      method: METHOD.POST,
    })
  ).json();
}
