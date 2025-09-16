import { COLUMN_IDENTIFIER } from "@databiosphere/findable-ui/lib/components/Table/common/columnIdentifier";
import { SORT_DIRECTION } from "@databiosphere/findable-ui/lib/config/entities";
import { SectionConfig } from "../../../components/Entity/components/EntityView/components/Section/entities";
import { Alert } from "../components/Alert/alert";
import { Table } from "../components/Table/table";
import { COLUMNS } from "./columns";

export const VIEW_SOURCE_DATASETS_INFO: SectionConfig<typeof Alert> = {
  Component: Alert,
  componentProps: {},
  slotProps: { section: { fullWidth: true } },
};

export const VIEW_SOURCE_DATASETS_TABLE: SectionConfig<typeof Table> = {
  Component: Table,
  componentProps: {
    tableOptions: {
      columns: COLUMNS,
      getRowId: (row) => row.id,
      initialState: {
        columnVisibility: { [COLUMN_IDENTIFIER.ROW_POSITION]: true },
        sorting: [
          { desc: SORT_DIRECTION.ASCENDING, id: "title" },
          { desc: SORT_DIRECTION.ASCENDING, id: "fileName" },
        ],
      },
    },
  },
  slotProps: { section: { fullWidth: true } },
};
