import { COLLATOR_CASE_INSENSITIVE } from "@databiosphere/findable-ui/lib/common/constants";
import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";

/**
 * The view should be rendered if:
 * - the user cannot view form (user is prompted to log in), or
 * - the user can view form and data is available (form is rendered with data).
 * @param canView - User can view form.
 * @param hasData - Data is available.
 * @returns true if the view should be rendered.
 */
export function shouldRenderView(canView: boolean, hasData = true): boolean {
  if (!canView) return true; // User is prompted to log in.
  return hasData;
}

/**
 * Sorts source dataset by publication and title, ascending.
 * @param sd0 - First source dataset to compare.
 * @param sd1 - Second source dataset to compare.
 * @returns number indicating sort precedence of sd0 vs sd1.
 */
export function sortLinkedSourceDataset(
  sd0: HCAAtlasTrackerSourceDataset,
  sd1: HCAAtlasTrackerSourceDataset
): number {
  return (
    COLLATOR_CASE_INSENSITIVE.compare(
      sd0.publicationString,
      sd1.publicationString
    ) || COLLATOR_CASE_INSENSITIVE.compare(sd0.title, sd1.title)
  );
}
