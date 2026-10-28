import { useLayoutHeight } from "@databiosphere/findable-ui/lib/components/Layout/hooks/UseLayoutHeight/hook";
import { STICKY_HEAD_COLUMNS } from "@databiosphere/findable-ui/lib/components/Table/common/constants";
import { TableBody } from "@databiosphere/findable-ui/lib/components/Table/components/TableBody/tableBody";
import {
  STICKY_HEAD_CONTEXT_VALUE,
  TableHeadContext,
} from "@databiosphere/findable-ui/lib/components/Table/components/TableHead/context";
import { TableHead } from "@databiosphere/findable-ui/lib/components/Table/components/TableHead/tableHead";
import { useStickyHeadColumns } from "@databiosphere/findable-ui/lib/components/Table/hooks/UseStickyHeadColumns/hook";
import { useVirtualization } from "@databiosphere/findable-ui/lib/components/Table/hooks/UseVirtualization/hook";
import {
  GridTable,
  StyledStickyHead,
} from "@databiosphere/findable-ui/lib/components/Table/table.styles";
import { getColumnTrackSizing } from "@databiosphere/findable-ui/lib/components/TableCreator/options/columnTrackSizing/utils";
import { useCurrentBreakpoint } from "@databiosphere/findable-ui/lib/hooks/useCurrentBreakpoint";
import { PROPERTY } from "@databiosphere/findable-ui/lib/hooks/useHtmlStyle/constants";
import { TableContainer } from "@mui/material";
import { type RowData } from "@tanstack/react-table";
import { type JSX } from "react";
import { NO_ELEMENT_REF } from "./constants";
import { StyledTableScroll } from "./table.styles";
import { type Props } from "./types";
import { getRowDirection } from "./utils";

export const Table = <T extends RowData>({
  className,
  gridTemplateColumns,
  pageScroll = false,
  stickyHeader = false,
  table,
}: Props<T>): JSX.Element => {
  const bp = useCurrentBreakpoint();
  const rowDirection = getRowDirection(bp);
  // Virtualize rows so large detail tables only render what's near the
  // viewport: against the page when it scrolls, else in the table's own box.
  const { rows, scrollElementRef, virtualizer } = useVirtualization({
    pageScroll,
    rowDirection,
    table,
  });
  const columns =
    gridTemplateColumns || getColumnTrackSizing(table.getVisibleFlatColumns());
  // Keeps the pinned copy of the column head on the table's column widths; only
  // a page scroll table has one.
  useStickyHeadColumns(
    pageScroll ? scrollElementRef : NO_ELEMENT_REF,
    columns,
    pageScroll,
  );
  // The pinned head's height, for the page's scroll padding: a column title can wrap.
  const { ref: stickyHeadRef } = useLayoutHeight<HTMLDivElement>(
    PROPERTY.TABLE_HEAD_HEIGHT,
  );
  const tableContainer = (
    <TableContainer className={className} ref={scrollElementRef}>
      <GridTable
        collapsable
        gridTemplateColumns={columns}
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
  if (!pageScroll) return tableContainer;
  // The page scrolls, so a copy of the column head pins below the hero and
  // follows the table's sideways scroll, as on findable-ui's index table.
  return (
    <StyledTableScroll>
      <StyledStickyHead aria-hidden>
        <div ref={stickyHeadRef}>
          <GridTable
            gridTemplateColumns={`var(${STICKY_HEAD_COLUMNS}, ${columns})`}
            stickyHeader
          >
            <TableHeadContext.Provider value={STICKY_HEAD_CONTEXT_VALUE}>
              <TableHead tableInstance={table} />
            </TableHeadContext.Provider>
          </GridTable>
        </div>
      </StyledStickyHead>
      {tableContainer}
    </StyledTableScroll>
  );
};
