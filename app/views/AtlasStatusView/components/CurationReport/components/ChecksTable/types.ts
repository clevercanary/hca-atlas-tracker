import { type AtlasCheck } from "@/app/views/AtlasStatusView/components/CurationReport/types";

export interface Props {
  checks: AtlasCheck[];
  fileCount: number;
  onFailedClick: (check: AtlasCheck) => void;
}
