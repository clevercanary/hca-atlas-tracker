import { type HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { CORE_OPTIONS } from "@/app/components/Table/options/core/constants";
import { SORTING_OPTIONS } from "@/app/components/Table/options/sorting/constants";
import { useEntity } from "@/app/providers/entity/hook";
import { COLUMNS } from "@/app/views/SourceDatasetsView/components/Table/columns";
import { type EntityData } from "@/app/views/SourceDatasetsView/entities";
import { COLUMN_IDENTIFIER } from "@databiosphere/findable-ui/lib/components/Table/common/columnIdentifier";
import { SORT_DIRECTION } from "@databiosphere/findable-ui/lib/config/entities";
import { useReactTable } from "@tanstack/react-table";
import { type UseSourceDatasetsTable } from "./entities";

export const useSourceDatasetsTable = (): UseSourceDatasetsTable => {
  const { data } = useEntity();
  const { sourceDatasets = [] } = data as EntityData;

  const table = useReactTable<HCAAtlasTrackerSourceDataset>({
    columns: COLUMNS,
    data: sourceDatasets,
    ...CORE_OPTIONS,
    ...SORTING_OPTIONS,
    getRowId: (row) => row.id,
    initialState: {
      columnVisibility: { [COLUMN_IDENTIFIER.ROW_POSITION]: true },
      sorting: [{ desc: SORT_DIRECTION.ASCENDING, id: "title" }],
    },
  });

  return { table };
};
