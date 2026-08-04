import { type SectionConfig } from "@/app/components/Entity/components/EntityView/components/Section/entities";
import { Table } from "@/app/views/IntegratedObjectSourceDatasetsView/components/Table/table";

export const VIEW_INTEGRATED_OBJECT_SOURCE_DATASETS_TABLE: SectionConfig<
  typeof Table
> = {
  Component: Table,
  componentProps: {},
  slotProps: { section: { fullWidth: true } },
};
