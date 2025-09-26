import { SectionConfig } from "../../../components/Entity/components/EntityView/components/Section/entities";
import { Report } from "../components/Report/report";

export const INTEGRATED_OBJECT_VALIDATION_REPORT: SectionConfig<typeof Report> =
  {
    Component: Report,
    componentProps: {},
    slotProps: { section: { fullWidth: true } },
  };
