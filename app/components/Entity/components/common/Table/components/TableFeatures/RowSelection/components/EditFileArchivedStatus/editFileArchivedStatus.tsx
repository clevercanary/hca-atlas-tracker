import { useArchivedState } from "@/app/components/Entity/providers/archived/hook";
import { FileArchivedStatus } from "@/app/components/Forms/components/FileArchivedStatus/fileArchivedStatus";
import { Payload } from "@/app/hooks/UseEditFileArchived/entities";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { fetchData } from "@/app/providers/fetchDataState/actions/fetchData/dispatch";
import { useQueryClient } from "@tanstack/react-query";
import { Row, RowData } from "@tanstack/react-table";
import { JSX } from "react";
import { Props } from "./entities";

export const EditFileArchivedStatus = <T extends RowData>({
  fetchKeys,
  queryKeys,
  rows,
  table,
}: Props<T>): JSX.Element | null => {
  const { archivedState } = useArchivedState();
  const { archived } = archivedState;
  const { fetchDataDispatch } = useFetchDataState();
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
          fetchDataDispatch(fetchData(fetchKeys));
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
