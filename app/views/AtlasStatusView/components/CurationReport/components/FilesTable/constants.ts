import {
  FILE_KIND_PLURAL_LABEL,
  VERDICT_LABEL,
} from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import { labelColumn } from "@/app/views/AtlasStatusView/components/CurationReport/hooks/UseFilterTable/utils";
import {
  type AtlasCheck,
  type CurationFile,
  VERDICT,
  type Verdict,
} from "@/app/views/AtlasStatusView/components/CurationReport/types";
import { type ColumnDef } from "@tanstack/react-table";

// Files that need the most attention first.
export const VERDICT_ORDER: Verdict[] = [
  VERDICT.NEEDS_WORK,
  VERDICT.NOT_STARTED,
  VERDICT.PUBLISHING_STEPS,
  VERDICT.READY,
];

export const FILE_COLUMN_ID = {
  FAILED_CHECK: "failedCheck",
  FILE: "file",
  ISSUE: "issue",
  KIND: "kind",
  STATE: "state",
} as const;

/**
 * Filterable file columns, including the checks each file failed.
 * @param checks - The atlas's checks.
 * @returns Column definitions.
 */
export const getFileColumns = (
  checks: AtlasCheck[],
): ColumnDef<CurationFile>[] => [
  labelColumn(FILE_COLUMN_ID.KIND, "Kind", (file) => [
    FILE_KIND_PLURAL_LABEL[file.kind],
  ]),
  labelColumn(FILE_COLUMN_ID.STATE, "State", (file) => [
    VERDICT_LABEL[file.verdict],
  ]),
  labelColumn(FILE_COLUMN_ID.ISSUE, "Issue", (file) =>
    [...file.needsWork, ...file.publishingSteps].map((issue) => issue.title),
  ),
  labelColumn(FILE_COLUMN_ID.FILE, "File", (file) => [file.displayName]),
  labelColumn(FILE_COLUMN_ID.FAILED_CHECK, "Failed checks", (file) =>
    checks
      .filter((check) => !file.looksGood.some(({ id }) => id === check.id))
      .map((check) => check.title),
  ),
];
