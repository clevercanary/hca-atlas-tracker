import { COLUMN_IDENTIFIER } from "@databiosphere/findable-ui/lib/components/Table/common/columnIdentifier";
import { SORT_DIRECTION } from "@databiosphere/findable-ui/lib/config/entities";
import { useReactTable } from "@tanstack/react-table";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { CORE_OPTIONS } from "../../../../../../components/Table/options/core/constants";
import { SORTING_OPTIONS } from "../../../../../../components/Table/options/sorting/constants";
import { useEntity } from "../../../../../../providers/entity/hook";
import { EntityData } from "../../../../entities";
import { COLUMNS } from "../../columns";
import { UseSourceDatasetsTable } from "./entities";

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
