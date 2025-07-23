import { HCAAtlasTrackerEntrySheetValidation } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";

/**
 * Builds a summary object from the validation summary.
 * @param validationSummary - Validation summary.
 * @returns A summary object.
 */
export function buildSummaryValues(
  validationSummary:
    | HCAAtlasTrackerEntrySheetValidation["validationSummary"]
    | undefined
): Record<string, number> | undefined {
  if (!validationSummary) return;
  return {
    datasetCount: validationSummary.dataset_count ?? 0,
    donorCount: validationSummary.donor_count ?? 0,
    errorCount: validationSummary.error_count ?? 0,
    sampleCount: validationSummary.sample_count ?? 0,
  };
}
