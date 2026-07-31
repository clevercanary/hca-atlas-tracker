import { RowSelection } from "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/rowSelection";
import { ArchivedStatusToggle } from "@/app/components/Entity/components/common/Table/components/TableToolbar/components/ArchivedStatusToggle/archiveStatusToggle";
import { Table as CommonTable } from "@/app/components/Entity/components/common/Table/table";
import { StyledFluidPaper } from "@/app/components/Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "@/app/components/Table/components/TablePlaceholder/tablePlaceholder";
import { Divider } from "@mui/material";
import { Fragment, JSX } from "react";
import { EditSelection } from "./components/RowSelection/components/EditSelection/editSelection";
import { useSourceDatasetsTable } from "./hooks/UseSourceDatasetsTable/hook";
import { StyledToolbar } from "./table.styles";

export const Table = (): JSX.Element => {
  const { access, table } = useSourceDatasetsTable();
  const { canEdit = false } = access || {};

  return (
    <StyledFluidPaper elevation={0}>
      {canEdit && (
        <Fragment>
          <StyledToolbar>
            <RowSelection component={EditSelection} table={table} />
            <ArchivedStatusToggle />
          </StyledToolbar>
          <Divider />
        </Fragment>
      )}
      {table.getRowCount() > 0 && <CommonTable stickyHeader table={table} />}
      <TablePlaceholder
        message="No source datasets"
        rowCount={table.getRowCount()}
      />
    </StyledFluidPaper>
  );
};
