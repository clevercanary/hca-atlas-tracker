import { SectionConfig } from "@/app/components/Entity/components/EntityView/components/Section/entities";
import { Report } from "@/app/views/AtlasSourceDatasetValidationView/components/Report/report";

export const SOURCE_DATASET_VALIDATION_REPORT: SectionConfig<typeof Report> = {
  Component: Report,
  componentProps: {},
  slotProps: { section: { fullWidth: true } },
};
