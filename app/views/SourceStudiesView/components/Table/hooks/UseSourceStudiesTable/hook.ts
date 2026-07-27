import { COLUMN_IDENTIFIER } from "@databiosphere/findable-ui/lib/components/Table/common/columnIdentifier";
import { SORT_DIRECTION } from "@databiosphere/findable-ui/lib/config/entities";
import { useReactTable } from "@tanstack/react-table";
import { HCAAtlasTrackerSourceStudy } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { CORE_OPTIONS } from "../../../../../../components/Table/options/core/constants";
import { SORTING_OPTIONS } from "../../../../../../components/Table/options/sorting/constants";
import { useEntity } from "../../../../../../providers/entity/hook";
import { EntityData } from "../../../../entities";
import { COLUMNS } from "../../columns";
import { TableMeta } from "../../entities";
import { UseSourceStudiesTable } from "./entities";

export const useSourceStudiesTable = (): UseSourceStudiesTable => {
  const { data, pathParameter } = useEntity();
  const { sourceStudies = [] } = data as EntityData;

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
