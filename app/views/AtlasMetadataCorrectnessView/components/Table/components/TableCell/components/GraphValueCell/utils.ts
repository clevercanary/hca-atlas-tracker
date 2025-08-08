/**
 * Get the graph color for the given value.
 * @param value - Value.
 * @returns Graph color.
 */
export function getGraphColor(value: number): string {
  if (value < 0.25) return `#BF0003`;
  if (value < 0.75) return `#B14A0A`;
  return `#257A24`;
}
