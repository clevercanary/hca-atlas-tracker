import {
  FileValidationSummary,
  FileValidatorName,
  REPROCESSED_STATUS,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { shouldShowValidator } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/utils";

/**
 * Returns the validators to render in the validation summary.
 * @param validationSummary - Validation summary.
 * @param reprocessedStatus - Source dataset reprocessed status, when applicable; used to hide validators that don't apply to reprocessed datasets.
 * @returns Filtered validator entries.
 */
export function getValidators(
  validationSummary: FileValidationSummary,
  reprocessedStatus?: REPROCESSED_STATUS,
): [FileValidatorName, boolean][] {
  return (
    Object.entries(validationSummary.validators) as [
      FileValidatorName,
      boolean,
    ][]
  ).filter(([name]) => shouldShowValidator(name, reprocessedStatus));
}
