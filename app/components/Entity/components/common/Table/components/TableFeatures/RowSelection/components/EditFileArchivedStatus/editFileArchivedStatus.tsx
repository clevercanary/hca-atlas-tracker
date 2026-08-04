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
        onSuccess: () => {
          table.resetRowSelection();
          queryKeys?.forEach((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
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
