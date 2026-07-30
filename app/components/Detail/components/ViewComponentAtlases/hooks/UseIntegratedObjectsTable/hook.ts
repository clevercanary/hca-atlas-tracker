import { useArchivedState } from "@/app/components/Entity/providers/archived/hook";
import { CORE_OPTIONS } from "@/app/components/Table/options/core/constants";
import { SORTING_OPTIONS } from "@/app/components/Table/options/sorting/constants";
import { useEntity } from "@/app/providers/entity/hook";
import { getAtlasComponentAtlasesTableColumns } from "@/app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  AtlasIntegratedObject,
  EntityData,
} from "@/app/views/ComponentAtlasesView/entities";
import { COLUMN_IDENTIFIER } from "@databiosphere/findable-ui/lib/components/Table/common/columnIdentifier";
import { SORT_DIRECTION } from "@databiosphere/findable-ui/lib/config/entities";
import { useReactTable } from "@tanstack/react-table";
import { UseIntegratedObjectsTable } from "./entities";

// Stable empty-array fallback: `useReactTable` requires a referentially stable
// `data` prop, and the query returns `undefined` while an integrated objects
// fetch is pending (e.g. the archived toggle changes the query key). A fresh
// `[]` default here would give the table a new reference every render and
// trigger an infinite re-render loop.
const NO_INTEGRATED_OBJECTS: AtlasIntegratedObject[] = [];

export const useIntegratedObjectsTable = (): UseIntegratedObjectsTable => {
  const { archivedState } = useArchivedState();
  const { data, formManager } = useEntity();
  const { integratedObjects = NO_INTEGRATED_OBJECTS } = data as EntityData;
  const { access } = formManager || {};
  const { canEdit = false } = access || {};
  const { archived } = archivedState;

  const table = useReactTable({
    columns: getAtlasComponentAtlasesTableColumns(),
    data: integratedObjects,
    ...CORE_OPTIONS,
    ...SORTING_OPTIONS,
    enableMultiRowSelection: canEdit,
    enableRowSelection: canEdit,
    getRowId: (row) => row.id,
    initialState: {
      sorting: [{ desc: SORT_DIRECTION.ASCENDING, id: "baseFileName" }],
    },
    meta: { canEdit },
    state: {
      columnVisibility: {
        [COLUMN_IDENTIFIER.ROW_POSITION]: !canEdit,
        [COLUMN_IDENTIFIER.ROW_SELECTION]: canEdit,
        atlasId: false,
        capIngestStatus: !archived,
        download: !archived,
        fileId: false,
        id: false,
        validationStatus: !archived,
      },
    },
  });

  return { access, table };
};
