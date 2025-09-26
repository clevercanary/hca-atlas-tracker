import { SectionConfig } from "../../../components/Entity/components/EntityView/components/Section/entities";
import { Summary } from "../components/Summary/summary";

export const SOURCE_DATASET_VALIDATION_SUMMARY: SectionConfig<typeof Summary> =
  {
    Component: Summary,
    componentProps: {},
    slotProps: { section: { fullWidth: true } },
  };
