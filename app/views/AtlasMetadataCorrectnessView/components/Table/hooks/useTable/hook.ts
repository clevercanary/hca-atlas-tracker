import {
  RowData,
  Table,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import { CORE_OPTIONS } from "../../../../../../../app/components/Table/options/core/constants";
import { VISIBILITY_OPTIONS } from "../../../../../../../app/components/Table/options/visibility/constants";
import { buildMeta, getRowId, makeColumns } from "./utils";

export const useTable = (data: RowData[]): Table<RowData> => {
  // Make columns.
  // We use the meta values in each column to determine initial column visibility.
  // Column visibility will either be "Required", "Recommended", or "Organ Specific", or all.
  // In the case of "all", we will show all columns.
  const columns = makeColumns(data);

  const meta = buildMeta(columns);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const state = {
    columnVisibility,
  };

  return useReactTable({
    columns,
    data,
    getRowId,
    ...CORE_OPTIONS,
    ...VISIBILITY_OPTIONS,
    onColumnVisibilityChange: setColumnVisibility,
    state,
    meta,
  });
};
