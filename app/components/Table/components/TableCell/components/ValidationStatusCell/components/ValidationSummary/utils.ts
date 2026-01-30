import {
  FileValidationSummary,
  FileValidatorName,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

/**
 * Returns the validation summary validators.
 * @param validationSummary - Validation summary.
 * @returns Validation summary validators.
 */
export function getValidators(
  validationSummary: FileValidationSummary,
): [FileValidatorName, boolean][] {
  return (
    Object.entries(validationSummary.validators) as [
      FileValidatorName,
      boolean,
    ][]
  ).filter(filterValidator);
}

/**
 * Returns true if the validator is not cellxgene.
 * @param validator - Validator.
 * @returns True if the validator is not cellxgene.
 */
function filterValidator(validator: [FileValidatorName, boolean]): boolean {
  return validator[0] !== "cellxgene";
}
