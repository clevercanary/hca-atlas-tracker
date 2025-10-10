import { Row, RowData } from "@tanstack/react-table";
import { Payload } from "../../../../../../../../../../hooks/UseEditFileArchived/entities";
import { useFetchDataState } from "../../../../../../../../../../hooks/useFetchDataState";
import { fetchData } from "../../../../../../../../../../providers/fetchDataState/actions/fetchData/dispatch";
import { FileArchivedStatus } from "../../../../../../../../../Forms/components/FileArchivedStatus/fileArchivedStatus";
import { useArchivedState } from "../../../../../../../../providers/archived/hook";
import { Props } from "./entities";

export const EditFileArchivedStatus = <T extends RowData>({
  rows,
  table,
}: Props<T>): JSX.Element | null => {
  const { archivedState } = useArchivedState();
  const { archived } = archivedState;
  const { fetchDataDispatch } = useFetchDataState();
  return (
    <FileArchivedStatus
      isArchived={archived}
      payload={mapPayload(rows)}
      options={{
        onSuccess: () => {
          table.resetRowSelection();
          fetchDataDispatch(fetchData());
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
