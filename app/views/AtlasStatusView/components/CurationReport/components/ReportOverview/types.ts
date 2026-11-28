import { type ReportState } from "@/app/views/AtlasStatusView/components/CurationReport/hooks/UseReportState/hook";
import { type CurationReportProps } from "@/app/views/AtlasStatusView/components/CurationReport/types";

export interface Props extends CurationReportProps {
  state: ReportState;
}
