import { SectionConfig } from "../../../components/Entity/components/EntityView/components/Section/entities";
import { ValidationReport } from "../components/ValidationReport/validationReport";

export const METADATA_ENTRY_SHEET_VALIDATION_REPORT: SectionConfig<
  typeof ValidationReport
> = {
  Component: ValidationReport,
  componentProps: {},
  showDivider: true,
};
