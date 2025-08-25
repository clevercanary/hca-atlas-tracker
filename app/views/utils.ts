/**
 * Capitalizes the first letter of a string.
 * @param str - String to capitalize.
 * @returns String with first letter capitalized.
 */
export function capitalizeFirst(str: string): string {
  return str.replace(/^./, (match) => match.toUpperCase());
}
