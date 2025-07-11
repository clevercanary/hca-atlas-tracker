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
): Map<EntityType | "entrySheet", ValidationErrorInfo[]> | undefined {
  if (!data.entrySheetValidation) return;

  return data.entrySheetValidation.validationReport
    .sort(sortReport)
    .reduce(
      mapReport,
      new Map<EntityType | "entrySheet", ValidationErrorInfo[]>()
    );
}

/**
 * Maps validation report to entity reports.
 * @param acc - Accumulator of entity reports.
 * @param report - Validation report.
 * @returns Map of entity type to validation report.
 */
function mapReport(
  acc: Map<EntityType | "entrySheet", ValidationErrorInfo[]>,
  report: ValidationErrorInfo
): Map<EntityType | "entrySheet", ValidationErrorInfo[]> {
  const entityReports = acc.get(report.entity_type ?? "entrySheet") || [];
  entityReports.push(report);
  acc.set(report.entity_type ?? "entrySheet", entityReports);
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
