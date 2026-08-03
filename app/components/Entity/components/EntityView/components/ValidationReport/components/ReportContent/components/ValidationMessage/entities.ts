import { type ReportSeverity } from "@/app/components/Entity/components/EntityView/components/ValidationReport/components/ReportContent/entities";

export interface Props {
  message: string;
  severity: ReportSeverity;
}
