import { FILE_VALIDATOR_NAMES } from "../apis/catalog/hca-atlas-tracker/common/constants";
import {
  FileValidationReport,
  FileValidationReports,
  FileValidationSummary,
  FileValidatorName,
} from "../apis/catalog/hca-atlas-tracker/common/entities";

/**
 * Build validation reports and summary objects from per-validator reports.
 * @param reportsByValidator - Per-validator file validation reports.
 * @returns validation reports and summary.
 */
export function buildValidationReportsAndSummary(
  reportsByValidator: Record<FileValidatorName, FileValidationReport>,
): [FileValidationReports, FileValidationSummary] {
  const validationReports: FileValidationReports = {};
  const validationSummary: FileValidationSummary = {
    overallValid: true,
    validators: {},
  };
  for (const validatorName of FILE_VALIDATOR_NAMES) {
    const report = reportsByValidator[validatorName];
    validationReports[validatorName] = report;
    validationSummary.validators[validatorName] = {
      errorCount: report.errors.length,
      valid: report.valid,
      warningCount: report.warnings.length,
    };
    validationSummary.overallValid =
      validationSummary.overallValid && report.valid;
  }
  return [validationReports, validationSummary];
}
