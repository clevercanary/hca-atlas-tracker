import { FILE_VALIDATOR_NAMES } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import {
  FileValidationReports,
  FileValidatorName,
  REPROCESSED_STATUS,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { shouldShowValidator } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/utils";

/**
 * Returns the validator names to render as tabs, in canonical FILE_VALIDATOR_NAMES order.
 * Postgres stores validation reports as jsonb, which does not preserve object key order, so the display order is driven off the constant rather than off the incoming object.
 * @param validationReports - Validation reports for the file.
 * @param reprocessedStatus - Source dataset reprocessed status, when applicable; used to hide validators that don't apply to reprocessed datasets.
 * @returns The validator names to render as tabs.
 */
export function getValidatorNames(
  validationReports?: FileValidationReports | null,
  reprocessedStatus?: REPROCESSED_STATUS,
): FileValidatorName[] {
  if (!validationReports) return [];
  return FILE_VALIDATOR_NAMES.filter(
    (name) =>
      validationReports[name] !== undefined &&
      shouldShowValidator(name, reprocessedStatus),
  );
}
