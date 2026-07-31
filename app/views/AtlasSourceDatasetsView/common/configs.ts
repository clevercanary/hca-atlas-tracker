import { SectionConfig } from "@/app/components/Entity/components/EntityView/components/Section/entities";
import { Alert } from "@/app/views/AtlasSourceDatasetsView/components/Alert/alert";
import { Table } from "@/app/views/AtlasSourceDatasetsView/components/Table/table";

export const VIEW_SOURCE_DATASETS_INFO: SectionConfig<typeof Alert> = {
  Component: Alert,
  componentProps: {},
  slotProps: { section: { fullWidth: true } },
};

export const VIEW_SOURCE_DATASETS_TABLE: SectionConfig<typeof Table> = {
  Component: Table,
  componentProps: {},
  slotProps: { section: { fullWidth: true } },
};
