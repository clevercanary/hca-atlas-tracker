import { COLLATOR_CASE_INSENSITIVE } from "@databiosphere/findable-ui/lib/common/constants";
import { EntityData } from "../../entities";
import { EntityType, ValidationErrorInfo } from "./entities";

/**
 * Builds entity validation reports for each entity type.
 * @param data - Entity data.
 * @returns Map of entity type to validation report.
 */
export function buildEntityValidationReports(
  data: EntityData
): Map<EntityType, ValidationErrorInfo[]> | undefined {
  if (!data.entrySheetValidation) return;

  return data.entrySheetValidation.validationReport
    .filter(filterReport)
    .sort(sortReport)
    .reduce(mapReport, new Map<EntityType, ValidationErrorInfo[]>());
}

/**
 * Filters validation report.
 * @param report - Validation report.
 * @returns True if report has entity type, false otherwise.
 */
function filterReport(report: ValidationErrorInfo): boolean {
  return Boolean(report.entity_type);
}

/**
 * Maps validation report to entity reports.
 * @param acc - Accumulator of entity reports.
 * @param report - Validation report.
 * @returns Map of entity type to validation report.
 */
function mapReport(
  acc: Map<EntityType, ValidationErrorInfo[]>,
  report: ValidationErrorInfo
): Map<EntityType, ValidationErrorInfo[]> {
  const entityReports = acc.get(report.entity_type!) || [];
  entityReports.push(report);
  acc.set(report.entity_type!, entityReports);
  return acc;
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
