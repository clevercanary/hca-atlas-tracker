import { type CurationIssue } from "@/app/views/AtlasStatusView/components/CurationReport/types";
import { type ChipProps } from "@mui/material";

export interface Props {
  issue: CurationIssue;
  label?: string;
  labelColor?: ChipProps["color"];
  showEvidence?: boolean;
}
