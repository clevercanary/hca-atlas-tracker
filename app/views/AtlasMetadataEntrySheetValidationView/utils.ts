import { formatDistanceToNowStrict } from "date-fns";
import { HCAAtlasTrackerEntrySheetValidation } from "../../apis/catalog/hca-atlas-tracker/common/entities";

/**
 * Returns subtitle for entry sheet validation view.
 * @param entrySheetValidation - Entry sheet validation.
 * @returns Subtitle.
 */
export function renderSubTitle(
  entrySheetValidation?: HCAAtlasTrackerEntrySheetValidation
): string | null {
  if (!entrySheetValidation || !entrySheetValidation.lastUpdated) return null;
  const { lastUpdated: { by, date } = {} } = entrySheetValidation;
  // Return null if by or date is undefined.
  if (!by || !date) return null;
  return `Last updated by ${by} ${formatDistanceToNowStrict(date)} ago`;
}

/**
 * Returns title for entry sheet validation view.
 * @param entrySheetValidation - Entry sheet validation.
 * @returns Title.
 */
export function renderTitle(
  entrySheetValidation?: HCAAtlasTrackerEntrySheetValidation
): string {
  if (!entrySheetValidation) return "Metadata Entry Sheet Validation";
  return `Report: ${entrySheetValidation.entrySheetTitle}`;
}
