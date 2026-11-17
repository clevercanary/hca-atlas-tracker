import { type CurationIssue } from "@/app/views/AtlasStatusView/components/CurationReport/types";

export interface Props {
  issues: CurationIssue[];
  showEvidence?: boolean;
}
