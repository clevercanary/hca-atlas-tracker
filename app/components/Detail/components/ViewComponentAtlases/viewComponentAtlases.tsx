import { RowSelection } from "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/rowSelection";
import { ArchivedStatusToggle } from "@/app/components/Entity/components/common/Table/components/TableToolbar/components/ArchivedStatusToggle/archiveStatusToggle";
import { Table as CommonTable } from "@/app/components/Entity/components/common/Table/table";
import { PinnedTableToolbar } from "@/app/components/Table/components/PinnedTableToolbar/pinnedTableToolbar";
import { StyledFluidPaper } from "@/app/components/Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "@/app/components/Table/components/TablePlaceholder/tablePlaceholder";
import { type JSX } from "react";
import { EditSelection } from "./components/EditSelection/editSelection";
import { useIntegratedObjectsTable } from "./hooks/UseIntegratedObjectsTable/hook";

export const ViewComponentAtlases = (): JSX.Element => {
  const { access, table } = useIntegratedObjectsTable();
  const { canEdit = false } = access || {};

  return (
    <StyledFluidPaper elevation={0}>
      {canEdit && (
        <PinnedTableToolbar>
          <RowSelection component={EditSelection} table={table} />
          <ArchivedStatusToggle />
        </PinnedTableToolbar>
      )}
      {table.getRowCount() > 0 && (
        <CommonTable pageScroll stickyHeader table={table} />
      )}
      <TablePlaceholder
        message="No integrated objects"
        rowCount={table.getRowCount()}
      />
    </StyledFluidPaper>
  );
};
