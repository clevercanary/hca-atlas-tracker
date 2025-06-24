import { array, InferType, mixed, number, object, string } from "yup";
import { fetchEntrySheetValidationResults } from "./hca-validation-tools-api";

const googleLastUpdateInfoSchema = object({
  by: string().defined(),
  by_email: string().defined().nullable(),
  date: string().defined(),
}).strict();

const entrySheetValidationSummarySchema = object({
  dataset_count: number().defined().nullable(),
  donor_count: number().defined().nullable(),
  error_count: number().defined(),
  sample_count: number().defined().nullable(),
}).strict();

const entrySheetValidationErrorInfoSchema = object({
  cell: string().defined().nullable(),
  column: string().defined().nullable(),
  entity_type: string()
    .oneOf(["dataset", "donor", "sample"])
    .defined()
    .nullable(),
  input: mixed<string | Record<string, unknown>>().defined().nullable(),
  message: string().defined(),
  primary_key: string().defined().nullable(),
  row: number().defined().nullable(),
  worksheet_id: number().defined().nullable(),
}).strict();

const entrySheetValidationResponseSuccessSchema = object({
  errors: array(entrySheetValidationErrorInfoSchema.defined()).defined(),
  last_updated: googleLastUpdateInfoSchema.defined().nullable(),
  sheet_title: string().defined().nullable(),
  summary: entrySheetValidationSummarySchema.defined().nullable(),
}).strict();

const entrySheetValidationResponseErrorSchema = object({
  error: string().defined(),
}).strict();

const entrySheetValidationResponseSchema = mixed<EntrySheetValidationResponse>()
  .required()
  .test("matches-error-or-success", (value) => {
    (value && "error" in value
      ? entrySheetValidationResponseErrorSchema
      : entrySheetValidationResponseSuccessSchema
    ).validateSync(value);
    return true;
  });

export type GoogleLastUpdateInfo = InferType<typeof googleLastUpdateInfoSchema>;

export type EntrySheetValidationSummary = InferType<
  typeof entrySheetValidationSummarySchema
>;

export type EntrySheetValidationErrorInfo = InferType<
  typeof entrySheetValidationErrorInfoSchema
>;

export type EntrySheetValidationResponseSuccess = InferType<
  typeof entrySheetValidationResponseSuccessSchema
>;

export type EntrySheetValidationResponseError = InferType<
  typeof entrySheetValidationResponseErrorSchema
>;

export type EntrySheetValidationResponse =
  | EntrySheetValidationResponseSuccess
  | EntrySheetValidationResponseError;

export async function validateEntrySheet(
  googleSheetId: string
): Promise<EntrySheetValidationResponse> {
  return await entrySheetValidationResponseSchema.validate(
    await fetchEntrySheetValidationResults(googleSheetId)
  );
}
