import { TableBody } from "@databiosphere/findable-ui/lib/components/Table/components/TableBody/tableBody";
import { TableHead } from "@databiosphere/findable-ui/lib/components/Table/components/TableHead/tableHead";
import { useVirtualization } from "@databiosphere/findable-ui/lib/components/Table/hooks/UseVirtualization/hook";
import { GridTable } from "@databiosphere/findable-ui/lib/components/Table/table.styles";
import { getColumnTrackSizing } from "@databiosphere/findable-ui/lib/components/TableCreator/options/columnTrackSizing/utils";
import { useCurrentBreakpoint } from "@databiosphere/findable-ui/lib/hooks/useCurrentBreakpoint";
import { TableContainer } from "@mui/material";
import { RowData } from "@tanstack/react-table";
import { JSX } from "react";
import { Props } from "./types";
import { getRowDirection } from "./utils";

export const Table = <T extends RowData>({
  className,
  gridTemplateColumns,
  stickyHeader = false,
  table,
}: Props<T>): JSX.Element => {
  const bp = useCurrentBreakpoint();
  const rowDirection = getRowDirection(bp);
  // Virtualize rows so large detail tables only render what's near the
  // viewport; the surrounding layout already provides the sticky scroll area.
  const { rows, scrollElementRef, virtualizer } = useVirtualization({
    rowDirection,
    table,
  });
  return (
    <TableContainer className={className} ref={scrollElementRef}>
      <GridTable
        collapsable
        gridTemplateColumns={
          gridTemplateColumns ||
          getColumnTrackSizing(table.getVisibleFlatColumns())
        }
        stickyHeader={stickyHeader}
      >
        <TableHead tableInstance={table} />
        <TableBody
          rowDirection={rowDirection}
          rows={rows}
          tableInstance={table}
          virtualizer={virtualizer}
        />
      </GridTable>
    </TableContainer>
  );
};
