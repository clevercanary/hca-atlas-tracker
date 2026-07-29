import { useArchivedState } from "@/app/components/Entity/providers/archived/hook";
import { CORE_OPTIONS } from "@/app/components/Table/options/core/constants";
import { SORTING_OPTIONS } from "@/app/components/Table/options/sorting/constants";
import { useEntity } from "@/app/providers/entity/hook";
import { COLUMNS } from "@/app/views/AtlasSourceDatasetsView/components/Table/columns";
import { EntityData } from "@/app/views/AtlasSourceDatasetsView/entities";
import { COLUMN_IDENTIFIER } from "@databiosphere/findable-ui/lib/components/Table/common/columnIdentifier";
import { SORT_DIRECTION } from "@databiosphere/findable-ui/lib/config/entities";
import { useReactTable } from "@tanstack/react-table";
import { UseSourceDatasetsTable } from "./entities";

export const useSourceDatasetsTable = (): UseSourceDatasetsTable => {
  const { archivedState } = useArchivedState();
  const { data, formManager } = useEntity();
  const { atlasSourceDatasets = [] } = data as EntityData;
  const { access } = formManager || {};
  const { canEdit = false } = access || {};
  const { archived } = archivedState;

  const table = useReactTable({
    columns: COLUMNS,
    data: atlasSourceDatasets,
    ...CORE_OPTIONS,
    ...SORTING_OPTIONS,
    enableMultiRowSelection: canEdit,
    enableRowSelection: canEdit,
    getRowId: (row) => row.id,
    initialState: {
      sorting: [
        { desc: SORT_DIRECTION.ASCENDING, id: "title" },
        { desc: SORT_DIRECTION.ASCENDING, id: "fileName" },
      ],
    },
    meta: { canEdit },
    state: {
      columnVisibility: {
        [COLUMN_IDENTIFIER.ROW_POSITION]: !canEdit,
        [COLUMN_IDENTIFIER.ROW_SELECTION]: canEdit,
        capIngestStatus: !archived,
        download: !archived,
        fileId: false,
        reprocessedStatus: !archived,
        validationStatus: !archived,
      },
    },
  });

  return { access, table };
};
