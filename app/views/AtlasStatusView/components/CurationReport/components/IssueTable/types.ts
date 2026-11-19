import {
  type AtlasIssue,
  type FileKind,
} from "@/app/views/AtlasStatusView/components/CurationReport/types";

export interface Props {
  issues: AtlasIssue[];
  kindTotals: Record<FileKind, number>;
  onCountClick: (issue: AtlasIssue, kind: FileKind) => void;
  statusUrl: string;
}
