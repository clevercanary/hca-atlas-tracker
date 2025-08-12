import { HeatmapClass } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";

/**
 * Filters out classes with no sheets.
 * @param classes - Classes.
 * @returns Classes with sheets.
 */
export function filterClasses(classes: HeatmapClass[] = []): HeatmapClass[] {
  return classes.filter((cls) => cls.sheets.length > 0);
}
