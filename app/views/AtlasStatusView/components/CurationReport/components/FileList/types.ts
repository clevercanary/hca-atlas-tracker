import { type CurationFile } from "@/app/views/AtlasStatusView/components/CurationReport/types";

export interface Props {
  files: CurationFile[];
  statusUrl: string;
}
