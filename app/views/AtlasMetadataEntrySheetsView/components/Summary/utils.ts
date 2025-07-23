import { MetadataEntrySheet } from "../../entities";

/**
 * Builds a summary object from the given entry sheets.
 * @param entrySheets - Entry sheets.
 * @returns Summary object.
 */
export function buildSummaryValues(
  entrySheets: MetadataEntrySheet[]
): Record<string, number> {
  return entrySheets.reduce(
    (acc, entrySheet) => {
      acc.datasetCount += entrySheet.validationSummary?.dataset_count || 0;
      acc.donorCount += entrySheet.validationSummary?.donor_count || 0;
      acc.errorCount += entrySheet.validationSummary?.error_count || 0;
      acc.sampleCount += entrySheet.validationSummary?.sample_count || 0;
      return acc;
    },
    { datasetCount: 0, donorCount: 0, errorCount: 0, sampleCount: 0 }
  );
}
