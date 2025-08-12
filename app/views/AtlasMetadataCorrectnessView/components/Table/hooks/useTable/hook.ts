import { useReactTable, VisibilityState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { HeatmapClass } from "../../../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { CORE_OPTIONS } from "../../../../../../../app/components/Table/options/core/constants";
import { VISIBILITY_OPTIONS } from "../../../../../../../app/components/Table/options/visibility/constants";
import { Table } from "./entities";
import {
  buildTableMeta,
  filterSheet,
  getRowId,
  initVisibilityState,
  makeColumns,
} from "./utils";

export const useTable = (cls: HeatmapClass): Table => {
  // Create columns with metadata for visibility grouping (required, recommended, organSpecific).
  const columns = makeColumns(cls.fields);

  // Filter out sheets that don't have correctness data.
  const data = useMemo(() => cls.sheets.filter(filterSheet), [cls.sheets]);

  // Build table meta (column visibility state for each toggle view).
  const meta = useMemo(() => buildTableMeta(columns), [columns]);

  // Initialize column visibility state.
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initVisibilityState(meta)
  );

  const state = { columnVisibility };

  return useReactTable({
    ...CORE_OPTIONS,
    ...VISIBILITY_OPTIONS,
    columns,
    data,
    getRowId,
    meta,
    onColumnVisibilityChange: setColumnVisibility,
    state,
  }) as Table;
};
