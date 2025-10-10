import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { RowSelection } from "../../../../components/Entity/components/common/Table/components/TableFeatures/RowSelection/rowSelection";
import { ArchivedStatusToggle } from "../../../../components/Entity/components/common/Table/components/TableToolbar/components/ArchivedStatusToggle/archiveStatusToggle";
import { Table as CommonTable } from "../../../../components/Entity/components/common/Table/table";
import { TablePlaceholder } from "../../../../components/Table/components/TablePlaceholder/tablePlaceholder";
import { EditSelection } from "./components/RowSelection/components/EditSelection/editSelection";
import { useSourceDatasetsTable } from "./hooks/UseSourceDatasetsTable/hook";
import { StyledToolbar } from "./table.styles";

export const Table = (): JSX.Element => {
  const { access, table } = useSourceDatasetsTable();
  const { canEdit = false } = access || {};

  return (
    <FluidPaper elevation={0}>
      <GridPaper>
        {canEdit && (
          <StyledToolbar>
            <RowSelection component={EditSelection} table={table} />
            <ArchivedStatusToggle />
          </StyledToolbar>
        )}
        {table.getRowCount() > 0 && <CommonTable table={table} />}
        <TablePlaceholder
          message="No source datasets"
          rowCount={table.getRowCount()}
        />
      </GridPaper>
    </FluidPaper>
  );
};
