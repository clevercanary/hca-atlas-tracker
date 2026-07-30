import { CORE_OPTIONS } from "@/app/components/Table/options/core/constants";
import { SORTING_OPTIONS } from "@/app/components/Table/options/sorting/constants";
import { useEntity } from "@/app/providers/entity/hook";
import { COLUMNS } from "@/app/views/IntegratedObjectSourceDatasetsView/components/Table/columns";
import {
  EntityData,
  IntegratedObjectSourceDataset,
} from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { SORT_DIRECTION } from "@databiosphere/findable-ui/lib/config/entities";
import { useReactTable } from "@tanstack/react-table";
import { UseIntegratedObjectSourceDatasetsTable } from "./entities";

// Stable empty-array fallback: `useReactTable` requires a referentially stable
// `data` prop, and the query returns `undefined` while the source datasets
// fetch is pending. The view mounts this table on `atlas && componentAtlas`
// (not on the list), so a fresh `[]` default here would give the table a new
// reference every render and trigger an infinite re-render loop.
const NO_INTEGRATED_OBJECT_SOURCE_DATASETS: IntegratedObjectSourceDataset[] =
  [];

export const useIntegratedObjectSourceDatasetsTable =
  (): UseIntegratedObjectSourceDatasetsTable => {
    const { data, formManager } = useEntity();
    const {
      integratedObjectSourceDatasets = NO_INTEGRATED_OBJECT_SOURCE_DATASETS,
    } = data as EntityData;
    const { access } = formManager || {};
    const { canEdit = false } = access || {};

    const table = useReactTable({
      columns: COLUMNS,
      data: integratedObjectSourceDatasets,
      ...CORE_OPTIONS,
      ...SORTING_OPTIONS,
      getRowId: (row) => row.id,
      initialState: {
        sorting: [
          { desc: SORT_DIRECTION.ASCENDING, id: "publicationString" },
          { desc: SORT_DIRECTION.ASCENDING, id: "title" },
        ],
      },
      state: { columnVisibility: { action: canEdit } },
    });

    return { access, table };
  };
