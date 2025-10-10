import { SectionConfig } from "../../../components/Entity/components/EntityView/components/Section/entities";
import { Alert } from "../components/Alert/alert";
import { Table } from "../components/Table/table";

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
