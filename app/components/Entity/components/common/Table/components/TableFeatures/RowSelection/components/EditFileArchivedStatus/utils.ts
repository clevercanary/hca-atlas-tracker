import {
  type OnSubmitOptions,
  type Payload,
} from "@/app/hooks/UseEditFileArchived/types";
import { type QueryKey } from "@tanstack/react-query";
import { type Row, type RowData, type Table } from "@tanstack/react-table";

/**
 * Returns the archive/unarchive options for the bulk row-selection control.
 *
 * Every key is dispatched rather than awaited, so the action's pending window
 * covers the request alone. The two detail-view call sites await their detail
 * invalidation because the button survives the success there and must not be
 * clickable against a stale `isArchived`; on this bulk surface there is no such
 * button to protect — the selection reset empties the selection, RowSelection
 * returns null at zero rows, and the whole toolbar unmounts before the
 * invalidations settle. Awaiting them only held an unmounting toolbar disabled.
 * @param table - Table whose selection is reset on success.
 * @param queryKeys - Query keys to invalidate, if any.
 * @returns archive/unarchive options.
 */
export function getArchiveOptions<T extends RowData>(
  table: Table<T>,
  queryKeys?: QueryKey[],
): OnSubmitOptions {
  return {
    invalidateQueryKeys: { dispatched: queryKeys },
    onSuccess: (): void => {
      table.resetRowSelection();
    },
  };
}

/**
 * Maps the payload.
 * Generates fileIds from selected rows.
 * @param rows - Rows.
 * @returns payload.
 */
export function mapPayload<T extends RowData>(rows: Row<T>[]): Payload {
  return { fileIds: rows.map((row) => row.getValue("fileId")) };
}
