import {
  FileValidationReports,
  FileValidatorName,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

/**
 * Returns the names of the validators that are not cellxgene.
 * @param validationReports - The validation reports to get the validator names from.
 * @returns The names of the validators that are not cellxgene.
 */
export function getValidatorNames(
  validationReports?: FileValidationReports | null
): FileValidatorName[] {
  return (Object.keys(validationReports ?? {}) as FileValidatorName[]).filter(
    filterValidatorName
  ) as FileValidatorName[];
}

/**
 * Returns true if the validator name is not cellxgene.
 * @param validatorName - The validator name to check.
 * @returns True if the validator name is not cellxgene.
 */
function filterValidatorName(validatorName: FileValidatorName): boolean {
  return validatorName !== "cellxgene";
}
