import { SORT_DIRECTION } from "@databiosphere/findable-ui/lib/config/entities";
import { SectionConfig } from "../../../components/Entity/components/EntityView/components/Section/entities";
import { Alert } from "../components/Alert/alert";
import { Summary } from "../components/Summary/summary";
import { Table } from "../components/Table/table";
import { COLUMNS } from "./columns";

export const METADATA_ENTRY_SHEETS_INFO: SectionConfig<typeof Alert> = {
  Component: Alert,
  componentProps: {},
  slotProps: { section: { fullWidth: true } },
};

export const METADATA_ENTRY_SHEETS_SUMMARY: SectionConfig<typeof Summary> = {
  Component: Summary,
  componentProps: {},
  slotProps: { section: { fullWidth: true } },
};

export const METADATA_ENTRY_SHEETS_VIEW_TABLE: SectionConfig<typeof Table> = {
  Component: Table,
  componentProps: {
    tableOptions: {
      columns: COLUMNS,
      getRowId: (row) => row.id,
      initialState: {
        sorting: [
          { desc: SORT_DIRECTION.ASCENDING, id: "publicationString" },
          { desc: SORT_DIRECTION.ASCENDING, id: "entrySheetTitle" },
        ],
      },
    },
  },
  slotProps: { section: { fullWidth: true } },
};
