import { COLUMN_IDENTIFIER } from "@databiosphere/findable-ui/lib/components/Table/common/columnIdentifier";
import { useReactTable } from "@tanstack/react-table";
import { useEntity } from "../../../../../../providers/entity/hook";
import { getAtlasComponentAtlasesTableColumns } from "../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { EntityData } from "../../../../../../views/ComponentAtlasesView/entities";
import { useArchivedState } from "../../../../../Entity/providers/archived/hook";
import { CORE_OPTIONS } from "../../../../../Table/options/core/constants";
import { UseIntegratedObjectsTable } from "./entities";

export const useIntegratedObjectsTable = (): UseIntegratedObjectsTable => {
  const { archivedState } = useArchivedState();
  const { data, formManager } = useEntity();
  const { integratedObjects = [] } = data as EntityData;
  const { access } = formManager || {};
  const { canEdit = false } = access || {};
  const { archived } = archivedState;

  const table = useReactTable({
    columns: getAtlasComponentAtlasesTableColumns(),
    data: integratedObjects,
    ...CORE_OPTIONS,
    enableMultiRowSelection: canEdit,
    enableRowSelection: canEdit,
    getRowId: (row) => row.id,
    meta: { canEdit },
    state: {
      columnVisibility: {
        [COLUMN_IDENTIFIER.ROW_POSITION]: !canEdit,
        [COLUMN_IDENTIFIER.ROW_SELECTION]: canEdit,
        atlasId: false,
        fileId: false,
        id: false,
        validationStatus: !archived,
      },
    },
  });

  return { access, table };
};
