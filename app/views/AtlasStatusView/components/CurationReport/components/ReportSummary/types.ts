import {
  type AtlasIssue,
  type CurationReport,
} from "@/app/views/AtlasStatusView/components/CurationReport/types";

export interface Props {
  issues: AtlasIssue[];
  publishingStepCount: number;
  report: CurationReport;
}
