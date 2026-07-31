import { Table as CommonTable } from "@/app/components/Entity/components/common/Table/table";
import { StyledFluidPaper } from "@/app/components/Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "@/app/components/Table/components/TablePlaceholder/tablePlaceholder";
import { CORE_OPTIONS } from "@/app/components/Table/options/core/constants";
import { SORTING_OPTIONS } from "@/app/components/Table/options/sorting/constants";
import { useEntity } from "@/app/providers/entity/hook";
import {
  EntityData,
  MetadataEntrySheet,
} from "@/app/views/AtlasMetadataEntrySheetsView/entities";
import { useReactTable } from "@tanstack/react-table";
import { JSX } from "react";
import { Props } from "./entities";

// Stable empty-array fallback: `useReactTable` requires a referentially stable
// `data` prop, and the query returns `undefined` while pending. The view mounts
// this table on `atlas` alone (not on the list), so a fresh `[]` default here
// would give the table a new reference every render.
const NO_ENTRY_SHEETS: MetadataEntrySheet[] = [];

export const Table = (props: Props): JSX.Element => {
  const { data } = useEntity();
  const { entrySheets = NO_ENTRY_SHEETS } = data as EntityData;
  const { tableOptions } = props;

  // Create table instance.
  const table = useReactTable({
    data: entrySheets,
    ...CORE_OPTIONS,
    ...SORTING_OPTIONS,
    ...tableOptions,
  });

  return (
    <StyledFluidPaper elevation={0}>
      {table.getRowCount() > 0 && <CommonTable stickyHeader table={table} />}
      <TablePlaceholder
        message="No metadata entry sheets"
        rowCount={table.getRowCount()}
      />
    </StyledFluidPaper>
  );
};
