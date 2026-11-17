import { SearchableColumnFilter } from "@/app/views/AtlasStatusView/components/CurationReport/components/SearchableColumnFilter/searchableColumnFilter";
import { BUTTON_GROUP_PROPS } from "@databiosphere/findable-ui/lib/components/common/ButtonGroup/constants";
import { ColumnFilters } from "@databiosphere/findable-ui/lib/components/DataDictionary/components/Filters/components/ColumnFilters/columnFilters";
import { bpDown820 } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { ButtonGroup, type Theme, useMediaQuery } from "@mui/material";
import { type RowData } from "@tanstack/react-table";
import { type JSX } from "react";
import { type Props } from "./types";

/**
 * Column filters as a button group of medium filter buttons, one per filterable column, each with a search field when its column has more values than its list shows at once. Below 820px, findable-ui's ColumnFilters filter drawer, which always has a search field.
 * @param props - Component props.
 * @param props.table - TanStack table instance.
 * @returns Column filters.
 */
export const ReportFilters = <T extends RowData>({
  table,
}: Props<T>): JSX.Element => {
  const isDrawer = useMediaQuery((theme: Theme) => bpDown820({ theme }));
  if (isDrawer) return <ColumnFilters table={table} />;
  return (
    <ButtonGroup {...BUTTON_GROUP_PROPS.SECONDARY_OUTLINED}>
      {table
        .getAllColumns()
        .filter((column) => column.getCanFilter())
        .map((column) => (
          <SearchableColumnFilter key={column.id} column={column} />
        ))}
    </ButtonGroup>
  );
};
