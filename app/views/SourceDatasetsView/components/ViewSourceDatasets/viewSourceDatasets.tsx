import { Table as CommonTable } from "@/app/components/Entity/components/common/Table/table";
import { StyledFluidPaper } from "@/app/components/Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "@/app/components/Table/components/TablePlaceholder/tablePlaceholder";
import { useSourceDatasetsTable } from "@/app/views/SourceDatasetsView/components/Table/hooks/UseSourceDatasetsTable/hook";
import { JSX } from "react";

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
