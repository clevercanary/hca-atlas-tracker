import { CellContext, RowData } from "@tanstack/react-table";

/**
 * Returns a partial CellContext for the given value.
 * This utility is used by TableCell components that only require the getValue function
 * from the CellContext.
 * @param value - Value.
 * @returns Partial CellContext.
 */
export function getPartialCellContext<T extends RowData, TValue>(
  value: TValue,
): CellContext<T, TValue> {
  return {
    getValue: () => value,
  } as CellContext<T, TValue>;
}
