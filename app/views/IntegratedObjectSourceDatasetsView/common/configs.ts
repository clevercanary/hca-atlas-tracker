import { SectionConfig } from "../../../components/Entity/components/EntityView/components/Section/entities";
import { Table } from "../components/Table/table";

export const VIEW_INTEGRATED_OBJECT_SOURCE_DATASETS_TABLE: SectionConfig<
  typeof Table
> = {
  Component: Table,
  componentProps: {},
  slotProps: { section: { fullWidth: true } },
};
