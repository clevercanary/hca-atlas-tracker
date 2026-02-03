import { SORT_DIRECTION } from "@databiosphere/findable-ui/lib/config/entities";
import { useReactTable } from "@tanstack/react-table";
import { CORE_OPTIONS } from "../../../../../../components/Table/options/core/constants";
import { SORTING_OPTIONS } from "../../../../../../components/Table/options/sorting/constants";
import { useEntity } from "../../../../../../providers/entity/hook";
import { EntityData } from "../../../../entities";
import { COLUMNS } from "../../columns";
import { UseIntegratedObjectSourceDatasetsTable } from "./entities";

export const useIntegratedObjectSourceDatasetsTable =
  (): UseIntegratedObjectSourceDatasetsTable => {
    const { data, formManager } = useEntity();
    const { integratedObjectSourceDatasets = [] } = data as EntityData;
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
