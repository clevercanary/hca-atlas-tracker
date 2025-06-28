import { MetadataEntrySheet } from "../../entities";
import { EntrySheetValidationSummary } from "./entities";

/**
 * Returns the validation summary counts for the given entry sheets.
 * @param entrySheets - Entry sheets.
 * @returns Validation summary counts.
 */
export function getValidationSummaryCounts(
  entrySheets: MetadataEntrySheet[]
): EntrySheetValidationSummary {
  return entrySheets.reduce(
    (acc, entrySheet) => {
      acc.dataset_count += entrySheet.validationSummary?.dataset_count || 0;
      acc.donor_count += entrySheet.validationSummary?.donor_count || 0;
      acc.error_count += entrySheet.validationSummary?.error_count || 0;
      acc.sample_count += entrySheet.validationSummary?.sample_count || 0;
      return acc;
    },
    { dataset_count: 0, donor_count: 0, error_count: 0, sample_count: 0 }
  );
}
