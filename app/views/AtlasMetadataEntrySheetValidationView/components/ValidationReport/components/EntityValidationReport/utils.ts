import { ValidationErrorInfo } from "../../entities";

/**
 * Returns the total number of validation reports for an entity.
 * @param columnValidationReports - Map of column to validation reports.
 * @returns Total number of validation reports.
 */
export function getEntityReportCount(
  columnValidationReports: Map<string, ValidationErrorInfo[]>
): number {
  return [...columnValidationReports.values()].reduce(
    (acc, reports) => acc + reports.length,
    0
  );
}
