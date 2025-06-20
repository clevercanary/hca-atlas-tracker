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
  dataset_count: number | null;
  donor_count: number | null;
  error_count: number;
  sample_count: number | null;
}

export async function validateEntrySheet(
  googleSheetId: string
): Promise<EntrySheetValidationResponse> {
  const validationApiUrl = process.env.HCA_VALIDATION_TOOLS_URL;
  if (!validationApiUrl)
    throw new Error("HCA_VALIDATION_TOOLS_URL not specified in environment");
  const body: EntrySheetValidationRequestBody = {
    sheet_id: googleSheetId,
  };
  return await (
    await fetch(validationApiUrl, {
      body: JSON.stringify(body),
      method: METHOD.POST,
    })
  ).json();
}
