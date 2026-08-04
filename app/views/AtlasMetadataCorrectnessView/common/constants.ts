import { type SectionConfig } from "@/app/components/Entity/components/EntityView/components/Section/entities";
import { Tables } from "@/app/views/AtlasMetadataCorrectnessView/components/Tables/tables";

export const METADATA_CORRECTNESS_VIEW_TABLES: SectionConfig<typeof Tables> = {
  Component: Tables,
  componentProps: {},
  slotProps: { section: { fullWidth: true } },
};
