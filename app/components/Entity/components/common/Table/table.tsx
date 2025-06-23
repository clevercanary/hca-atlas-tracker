import { TableBody } from "@databiosphere/findable-ui/lib/components/Detail/components/Table/components/TableBody/tableBody";
import { TableHead } from "@databiosphere/findable-ui/lib/components/Table/components/TableHead/tableHead";
import { GridTable } from "@databiosphere/findable-ui/lib/components/Table/table.styles";
import { getColumnTrackSizing } from "@databiosphere/findable-ui/lib/components/TableCreator/options/columnTrackSizing/utils";
import { useCurrentBreakpoint } from "@databiosphere/findable-ui/lib/hooks/useCurrentBreakpoint";
import { TableContainer } from "@mui/material";
import { RowData } from "@tanstack/react-table";
import { Props } from "./types";
import { getRowDirection } from "./utils";

export const Table = <T extends RowData>({
  className,
  table,
}: Props<T>): JSX.Element => {
  const bp = useCurrentBreakpoint();
  const rowDirection = getRowDirection(bp);
  return (
    <TableContainer className={className}>
      <GridTable
        collapsable
        gridTemplateColumns={getColumnTrackSizing(
          table.getVisibleFlatColumns()
        )}
      >
        <TableHead rowDirection={rowDirection} tableInstance={table} />
        <TableBody rowDirection={rowDirection} tableInstance={table} />
      </GridTable>
    </TableContainer>
  );
};
