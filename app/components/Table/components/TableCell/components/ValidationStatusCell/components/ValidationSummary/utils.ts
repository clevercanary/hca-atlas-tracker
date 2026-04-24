import { FILE_VALIDATOR_NAMES } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import {
  FileValidationSummary,
  FileValidatorName,
  REPROCESSED_STATUS,
  ValidatorSummaryStatus,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { shouldShowValidator } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/utils";

/**
 * Returns the validators to render in the validation summary, in canonical FILE_VALIDATOR_NAMES order.
 * Postgres stores the validators map as jsonb, which does not preserve object key order, so the display order is driven off the constant rather than off the incoming object.
 * @param validationSummary - Validation summary.
 * @param reprocessedStatus - Source dataset reprocessed status, when applicable; used to hide validators that don't apply to reprocessed datasets.
 * @returns Filtered validator entries.
 */
export function getValidators(
  validationSummary: FileValidationSummary,
  reprocessedStatus?: REPROCESSED_STATUS,
): [FileValidatorName, ValidatorSummaryStatus][] {
  const entries: [FileValidatorName, ValidatorSummaryStatus][] = [];
  for (const name of FILE_VALIDATOR_NAMES) {
    const value = validationSummary.validators[name];
    if (value === undefined) continue;
    if (!shouldShowValidator(name, reprocessedStatus)) continue;
    entries.push([name, value]);
  }
  return entries;
}
