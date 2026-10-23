/**
 * Returns the confirmation shown once a source dataset has been unlinked from
 * an integrated object, naming both.
 * @param sourceDatasetTitle - Title of the unlinked source dataset.
 * @param integratedObjectTitle - Title of the integrated object.
 * @returns success message.
 */
export function getUnlinkSuccessMessage(
  sourceDatasetTitle: string,
  integratedObjectTitle: string,
): string {
  return `Unlinked ${sourceDatasetTitle} from ${integratedObjectTitle}`;
}
