import {
  FILE_KIND_PLURAL_LABEL,
  FILE_KINDS,
} from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import { labelColumn } from "@/app/views/AtlasStatusView/components/CurationReport/hooks/UseFilterTable/utils";
import { type AtlasIssue } from "@/app/views/AtlasStatusView/components/CurationReport/types";
import {
  getFixedByLabel,
  getPriorityChip,
} from "@/app/views/AtlasStatusView/components/CurationReport/utils";
import { type ColumnDef } from "@tanstack/react-table";

export const COLUMN_ID = {
  FILE: "file",
  FIX_BY: "fixBy",
  KIND: "kind",
  PRIORITY: "priority",
} as const;

const getKindLabels = (issue: AtlasIssue): string[] =>
  FILE_KINDS.filter((kind) =>
    issue.files.some((file) => file.kind === kind),
  ).map((kind) => FILE_KIND_PLURAL_LABEL[kind]);

export const COLUMNS: ColumnDef<AtlasIssue>[] = [
  labelColumn(COLUMN_ID.PRIORITY, "Priority", (issue) => [
    getPriorityChip(issue).label,
  ]),
  labelColumn(COLUMN_ID.KIND, "Kind", getKindLabels),
  labelColumn(COLUMN_ID.FIX_BY, "Owner", (issue) =>
    issue.who ? [getFixedByLabel(issue.who)] : [],
  ),
  labelColumn(COLUMN_ID.FILE, "File", (issue) =>
    issue.files.map((file) => file.displayName),
  ),
];
