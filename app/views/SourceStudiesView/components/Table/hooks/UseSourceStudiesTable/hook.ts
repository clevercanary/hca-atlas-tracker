import { type HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { CORE_OPTIONS } from "@/app/components/Table/options/core/constants";
import { SORTING_OPTIONS } from "@/app/components/Table/options/sorting/constants";
import { useEntity } from "@/app/providers/entity/hook";
import { COLUMNS } from "@/app/views/SourceStudiesView/components/Table/columns";
import { type TableMeta } from "@/app/views/SourceStudiesView/components/Table/entities";
import { type EntityData } from "@/app/views/SourceStudiesView/entities";
import { COLUMN_IDENTIFIER } from "@databiosphere/findable-ui/lib/components/Table/common/columnIdentifier";
import { SORT_DIRECTION } from "@databiosphere/findable-ui/lib/config/entities";
import { useReactTable } from "@tanstack/react-table";
import { type UseSourceStudiesTable } from "./entities";

export const useSourceStudiesTable = (): UseSourceStudiesTable => {
  const { data, pathParameter } = useEntity();
  const { sourceStudies = [] } = data as EntityData;

  // The source study/dataset link cells build routes from the path parameter,
  // so fail fast (rather than emit broken URLs) if the provider omits it.
  if (!pathParameter) {
    throw new Error("Source studies table requires a path parameter.");
  }

  const table = useReactTable<HCAAtlasTrackerSourceStudy>({
    columns: COLUMNS,
    data: sourceStudies,
    ...CORE_OPTIONS,
    ...SORTING_OPTIONS,
    getRowId: (row) => row.id,
    initialState: {
      columnVisibility: {
        [COLUMN_IDENTIFIER.ROW_POSITION]: true,
        title: false,
      },
      sorting: [
        { desc: SORT_DIRECTION.ASCENDING, id: "sourceStudy" },
        { desc: SORT_DIRECTION.ASCENDING, id: "title" },
      ],
    },
    meta: { pathParameter } as TableMeta,
  });

  return { table };
};
