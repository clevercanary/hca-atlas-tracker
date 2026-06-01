import { SEVERITY } from "@databiosphere/findable-ui/lib/styles/common/mui/alert";
import { FILE_VALIDATION_STATUS_NAME_LABEL } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import {
  FILE_VALIDATION_STATUS,
  FileValidationReports,
  FileValidatorName,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ReportSeverity, ReportSummary } from "./entities";

/**
 * Builds an ordered list of severity-tagged report summaries (Errors first,
 * Warnings second) for a given validator, omitting empty sections. Returns a
 * fallback status string instead when no structured report is available for
 * the validator, or when the report contains no errors or warnings.
 * @param validationStatus - Validation status.
 * @param validationReports - Validation reports.
 * @param validatorName - Validator name.
 * @returns Either a non-empty list of report summaries to render, or a
 * fallback status string when there is nothing to summarise.
 */
export function getReportSummaries(
  validationStatus: FILE_VALIDATION_STATUS,
  validationReports?: FileValidationReports | null,
  validatorName?: FileValidatorName,
): ReportSummary[] | string {
  if (!validatorName || !validationReports) {
    return `Validation Status: ${FILE_VALIDATION_STATUS_NAME_LABEL[validationStatus]}`;
  }

  const { errors = [], warnings = [] } = validationReports[validatorName] || {};

  const summaries: ReportSummary[] = [];

  if (errors.length > 0) {
    summaries.push({
      messages: errors,
      severity: SEVERITY.ERROR as ReportSeverity,
      title: `Errors (${errors.length})`,
    });
  }

  if (warnings.length > 0) {
    summaries.push({
      messages: warnings,
      severity: SEVERITY.WARNING as ReportSeverity,
      title: `Warnings (${warnings.length})`,
    });
  }

  if (summaries.length === 0) {
    return "No errors or warnings reported.";
  }

  return summaries;
}
