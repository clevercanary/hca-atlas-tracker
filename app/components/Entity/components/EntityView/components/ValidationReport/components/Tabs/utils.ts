import {
  FileValidationReports,
  FileValidatorName,
  REPROCESSED_STATUS,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { shouldShowValidator } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/utils";

/**
 * Returns the names of the validators that should be shown as tabs.
 * @param validationReports - The validation reports to get the validator names from.
 * @param reprocessedStatus - Source dataset reprocessed status, when applicable; used to hide validators that don't apply to reprocessed datasets.
 * @returns The validator names to render as tabs.
 */
export function getValidatorNames(
  validationReports?: FileValidationReports | null,
  reprocessedStatus?: REPROCESSED_STATUS,
): FileValidatorName[] {
  return (Object.keys(validationReports ?? {}) as FileValidatorName[]).filter(
    (name) => shouldShowValidator(name, reprocessedStatus),
  );
}
