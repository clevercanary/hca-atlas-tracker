import { JSX } from "react";
import { Table as CommonTable } from "../../../../components/Entity/components/common/Table/table";
import { StyledFluidPaper } from "../../../../components/Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../../components/Table/components/TablePlaceholder/tablePlaceholder";
import { useSourceDatasetsTable } from "../Table/hooks/UseSourceDatasetsTable/hook";

export const ViewSourceDatasets = (): JSX.Element => {
  const { table } = useSourceDatasetsTable();

  return (
    <StyledFluidPaper elevation={0}>
      {table.getRowCount() > 0 && <CommonTable stickyHeader table={table} />}
      <TablePlaceholder
        message="No source datasets"
        rowCount={table.getRowCount()}
      />
    </StyledFluidPaper>
  );
};
