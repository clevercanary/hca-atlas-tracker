import { FILE_VALIDATION_STATUS_NAME_LABEL } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import {
  FILE_VALIDATION_STATUS,
  FileValidationReports,
  FileValidatorName,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

/**
 * Returns error and warning report values for a given validator.
 * @param validationStatus - Validation status.
 * @param validationReports - Validation reports.
 * @param validatorName - Validator name.
 * @returns Error and warning report values.
 */
export function getReportValues(
  validationStatus: FILE_VALIDATION_STATUS,
  validationReports?: FileValidationReports | null,
  validatorName?: FileValidatorName
): string[] {
  const values: string[] = [];

  if (!validatorName || !validationReports) {
    // If no validator name or validation reports are provided, return the validation status.
    values.push(
      `Validation Status: ${FILE_VALIDATION_STATUS_NAME_LABEL[validationStatus]}`
    );
    return values;
  }

  // Get the validation report for the given validator.
  const { errors = [], warnings = [] } = validationReports[validatorName] || {};

  // Add the errors and warnings to the values array.
  values.push(...errors);
  values.push(...warnings);

  if (values.length === 0) {
    // If no errors or warnings are found, return a message indicating that no errors or warnings were reported.
    values.push("No errors or warnings reported.");
  }

  // Return the validation report values.
  return values;
}
