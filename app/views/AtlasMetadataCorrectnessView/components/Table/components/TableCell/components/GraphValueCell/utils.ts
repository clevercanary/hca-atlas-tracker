import { CellContext } from "@tanstack/react-table";
import { HeatmapEntrySheet } from "../../../../../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";

/**
 * Return a formatted value (rounded to 2 decimal places if necessary).
 * @param value - Value.
 * @returns Formatted value.
 */
export function formatValue(value: number): string {
  return value % 1 === 0 ? value.toString() : value.toFixed(2);
}

/**
 * Get the row count as a denominator from the given cell context.
 * @param cellContext - Cell context.
 * @returns Denominator.
 */
export function getDenominator(
  cellContext: CellContext<HeatmapEntrySheet, number>
): number {
  return cellContext.row.original.correctness?.rowCount || 0;
}

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

/**
 * Returns graph values tuple [value, numerator, denominator] from the given cell context.
 * @param cellContext - Cell context.
 * @returns Graph values tuple [value, numerator, denominator].
 */
export function getGraphValues(
  cellContext: CellContext<HeatmapEntrySheet, number>
): [number, number, number] {
  const numerator = getNumerator(cellContext);
  const denominator = getDenominator(cellContext);

  if (denominator === 0) return [0, numerator, denominator];

  const value = numerator / denominator;

  return [value, numerator, denominator];
}

/**
 * Get the correct count as a numerator from the given cell context.
 * @param cellContext - Cell context.
 * @returns Numerator.
 */
export function getNumerator(
  cellContext: CellContext<HeatmapEntrySheet, number>
): number {
  return cellContext.getValue();
}

/**
 * Render the tooltip title.
 * @param value - Value.
 * @param numerator - Numerator.
 * @param denominator - Denominator.
 * @returns Tooltip title.
 */
export function renderTooltipTitle(
  value: number,
  numerator: number,
  denominator: number
): string | null {
  if (value === 1) return null;

  return `collected: ${numerator} / ${denominator}`;
}
