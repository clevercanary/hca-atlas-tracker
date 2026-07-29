import { Table as CommonTable } from "@/app/components/Entity/components/common/Table/table";
import { TablePlaceholder } from "@/app/components/Table/components/TablePlaceholder/tablePlaceholder";
import { Fragment, JSX } from "react";
import { useSourceStudiesTable } from "./hooks/UseSourceStudiesTable/hook";

export const Table = (): JSX.Element => {
  const { table } = useSourceStudiesTable();

  return (
    <Fragment>
      {table.getRowCount() > 0 && <CommonTable stickyHeader table={table} />}
      <TablePlaceholder
        message="No source studies"
        rowCount={table.getRowCount()}
      />
    </Fragment>
  );
};
