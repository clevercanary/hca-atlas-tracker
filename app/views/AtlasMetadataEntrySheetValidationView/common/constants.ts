import { SectionConfig } from "../../../components/Entity/components/EntityView/components/Section/entities";
import { Summary } from "../components/Summary/summary";
import { ValidationReport } from "../components/ValidationReport/validationReport";

export const METADATA_ENTRY_SHEET_VALIDATION_REPORT: SectionConfig<
  typeof ValidationReport
> = {
  Component: ValidationReport,
  componentProps: {},
  showDivider: true,
};

export const METADATA_ENTRY_SHEET_VALIDATION_SUMMARY: SectionConfig<
  typeof Summary
> = {
  Component: Summary,
  componentProps: {},
  slotProps: { section: { fullWidth: true } },
};
