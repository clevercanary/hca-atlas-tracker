import { useArchivedState } from "@/app/components/Entity/providers/archived/hook";
import { FileArchivedStatus } from "@/app/components/Forms/components/FileArchivedStatus/fileArchivedStatus";
import { type Payload } from "@/app/hooks/UseEditFileArchived/entities";
import { useQueryClient } from "@tanstack/react-query";
import { type Row, type RowData } from "@tanstack/react-table";
import { type JSX } from "react";
import { type Props } from "./entities";

export const EditFileArchivedStatus = <T extends RowData>({
  queryKeys,
  rows,
  table,
}: Props<T>): JSX.Element | null => {
  const { archivedState } = useArchivedState();
  const { archived } = archivedState;
  const queryClient = useQueryClient();

  return (
    <FileArchivedStatus
      isArchived={archived}
      payload={mapPayload(rows)}
      options={{
        // The invalidations are returned so onSubmit (which awaits onSuccess)
        // keeps the action pending until the refetched data lands — which is
        // what the two detail-view call sites need, where the button survives
        // the success. On the bulk row-selection surface it buys nothing: the
        // reset below empties the selection, RowSelection returns null at zero
        // rows, and the whole toolbar (button included) unmounts before the
        // invalidations settle.
        onSuccess: (): Promise<unknown> => {
          table.resetRowSelection();
          return Promise.all(
            (queryKeys ?? []).map((queryKey) =>
              queryClient.invalidateQueries({ queryKey }),
            ),
          );
        },
      }}
    />
  );
};

/**
 * Maps the payload.
 * Generates fileIds from selected rows.
 * @param rows - Rows.
 * @returns payload.
 */
function mapPayload<T extends RowData>(rows: Row<T>[]): Payload {
  return { fileIds: rows.map((row) => row.getValue("fileId")) };
}
