import {
  type CurationFile,
  type IssuePriority,
} from "@/app/views/AtlasStatusView/components/CurationReport/types";

export interface Props {
  files: CurationFile[];
  onCountClick: (file: CurationFile, priority: IssuePriority) => void;
  statusUrl: string;
}
