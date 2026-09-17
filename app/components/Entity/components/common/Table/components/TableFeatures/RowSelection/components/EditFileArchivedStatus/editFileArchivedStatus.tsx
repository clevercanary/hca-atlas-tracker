import { useArchivedState } from "@/app/components/Entity/providers/archived/hook";
import { FileArchivedStatus } from "@/app/components/Forms/components/FileArchivedStatus/fileArchivedStatus";
import { type RowData } from "@tanstack/react-table";
import { type JSX } from "react";
import { type Props } from "./entities";
import { getArchiveOptions, mapPayload } from "./utils";

export const EditFileArchivedStatus = <T extends RowData>({
  queryKeys,
  rows,
  table,
}: Props<T>): JSX.Element | null => {
  const { archivedState } = useArchivedState();
  const { archived } = archivedState;

  return (
    <FileArchivedStatus
      isArchived={archived}
      payload={mapPayload(rows)}
      options={getArchiveOptions(table, queryKeys)}
    />
  );
};
