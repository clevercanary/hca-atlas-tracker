import { type AtlasIssue } from "@/app/views/AtlasStatusView/components/CurationReport/types";

export interface Props {
  issue: AtlasIssue | null;
  onClose: () => void;
  statusUrl: string;
}
