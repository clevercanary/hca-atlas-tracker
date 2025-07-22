import { COLLATOR_CASE_INSENSITIVE } from "@databiosphere/findable-ui/lib/common/constants";
import { EntityData } from "../../entities";
import { COLUMN_KEY, MAX_REPORTS_TO_DISPLAY } from "./constants";
import { EntityType, ValidationErrorInfo } from "./entities";

/**
 * Builds entity validation reports for each entity type, keyed by entity type and then column.
 * @param data - Entity data.
 * @returns Map of entity type to validation report, keyed by entity type, and then column.
 */
export function buildEntityValidationReports(
  data: EntityData
):
  | Map<EntityType | "entrySheet", Map<string, ValidationErrorInfo[]>>
  | undefined {
  if (!data.entrySheetValidation) return;

  const entityReports = data.entrySheetValidation.validationReport
    .sort(sortReport)
    .reduce(
      mapReport,
      new Map<EntityType | "entrySheet", Map<string, ValidationErrorInfo[]>>()
    );

  return moveShortValidationErrorsToOther(entityReports);
}

/**
 * Maps validation report to entity reports.
 * @param acc - Accumulator of entity reports.
 * @param report - Validation report.
 * @returns Map of entity type to validation report.
 */
function mapReport(
  acc: Map<EntityType | "entrySheet", Map<string, ValidationErrorInfo[]>>,
  report: ValidationErrorInfo
): Map<EntityType | "entrySheet", Map<string, ValidationErrorInfo[]>> {
  const entityReports =
    acc.get(report.entity_type ?? "entrySheet") || new Map();

  // Group each report by column.
  const entityColumn =
    entityReports.get(report.column ?? COLUMN_KEY.OTHER) || [];
  entityColumn.push(report);
  entityReports.set(report.column ?? COLUMN_KEY.OTHER, entityColumn);

  acc.set(report.entity_type ?? "entrySheet", entityReports);
  return acc;
}

/**
 * Moves grouped by column validation errors to the "other" group when
 * there are only a few reports for the column.
 * @param entityReports - Map of entity type to validation report.
 * @returns Map of entity type to validation report.
 */
function moveShortValidationErrorsToOther(
  entityReports: Map<
    EntityType | "entrySheet",
    Map<string, ValidationErrorInfo[]>
  >
): Map<EntityType | "entrySheet", Map<string, ValidationErrorInfo[]>> {
  const columnsToDelete = [];
  for (const [, columnReports] of entityReports) {
    for (const [column, reports] of columnReports) {
      // Skip the group "other".
      if (column === COLUMN_KEY.OTHER) continue;
      // If there are more than the maximum number of reports to display, leave them grouped.
      if (reports.length >= MAX_REPORTS_TO_DISPLAY) continue;
      // Otherwise, move the reports to the "other" group.
      const otherReports = columnReports.get(COLUMN_KEY.OTHER) || [];
      otherReports.push(...reports);
      columnReports.set(COLUMN_KEY.OTHER, otherReports);
      // Mark the column for deletion, as it is bundled with the "other" group.
      columnsToDelete.push(column);
    }
    // Delete the columns that were bundled with the "other" group.
    for (const column of columnsToDelete) {
      columnReports.delete(column);
    }
  }
  return entityReports;
}

/**
 * Sorts validation report.
 * Sorting is by `entity_type` and then `cell` property.
 * @param r01 - First validation report.
 * @param r02 - Second validation report.
 * @returns -1 if a should come before b, 1 if b should come before a, 0 otherwise.
 */
function sortReport(
  r01: ValidationErrorInfo,
  r02: ValidationErrorInfo
): number {
  // Sort by entity type first.
  const firstCompare = COLLATOR_CASE_INSENSITIVE.compare(
    r01.entity_type ?? "",
    r02.entity_type ?? ""
  );

  // If entity types are different, return the comparison result.
  if (firstCompare !== 0) return firstCompare;

  // Sort by cell and return the result.
  return COLLATOR_CASE_INSENSITIVE.compare(r01.cell ?? "", r02.cell ?? "");
}
