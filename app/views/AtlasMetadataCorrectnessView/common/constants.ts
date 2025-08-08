import { SectionConfig } from "../../../components/Entity/components/EntityView/components/Section/entities";
import { Tables } from "../components/Tables/tables";

export const METADATA_CORRECTNESS_VIEW_TABLES: SectionConfig<typeof Tables> = {
  Component: Tables,
  componentProps: {},
  slotProps: { section: { fullWidth: true } },
};
