import { CHIP_PROPS } from "@/app/styles/common/mui/chip";
import { type ChipProps } from "@mui/material";
import {
  FILE_KIND,
  type FileKind,
  ISSUE_PRIORITY,
  type IssuePriority,
  VERDICT,
  type Verdict,
} from "./types";

export const PRIORITIES: IssuePriority[] = [
  ISSUE_PRIORITY.BLOCKS,
  ISSUE_PRIORITY.SHOULD_FIX,
  ISSUE_PRIORITY.CHECK,
];

export const PRIORITY_LABEL: Record<IssuePriority, string> = {
  [ISSUE_PRIORITY.BLOCKS]: "Blocks",
  [ISSUE_PRIORITY.CHECK]: "Check",
  [ISSUE_PRIORITY.SHOULD_FIX]: "Should fix",
};

export const PRIORITY_DESCRIPTION: Record<IssuePriority, string> = {
  [ISSUE_PRIORITY.BLOCKS]:
    "The tracker rejects the file or a check found a defect.",
  [ISSUE_PRIORITY.CHECK]: "Informational, or worth asking the producer about.",
  [ISSUE_PRIORITY.SHOULD_FIX]:
    "A refusal, a missing piece or a value to fill in.",
};

export const PRIORITY_COLOR: Record<IssuePriority, ChipProps["color"]> = {
  [ISSUE_PRIORITY.BLOCKS]: "error",
  [ISSUE_PRIORITY.CHECK]: "info",
  [ISSUE_PRIORITY.SHOULD_FIX]: CHIP_PROPS.COLOR.CAUTION,
};

export const FIXED_BY_LABEL: Record<string, string> = {
  "curation tool": "Curation tool",
  producer: "Producer",
  wrangler: "Wrangler",
};

export const FILE_KINDS: FileKind[] = [
  FILE_KIND.INTEGRATED_OBJECT,
  FILE_KIND.SOURCE_DATASET,
];

export const FILE_KIND_LABEL: Record<FileKind, string> = {
  [FILE_KIND.INTEGRATED_OBJECT]: "Integrated object",
  [FILE_KIND.SOURCE_DATASET]: "Source dataset",
};

export const FILE_KIND_PLURAL_LABEL: Record<FileKind, string> = {
  [FILE_KIND.INTEGRATED_OBJECT]: "Integrated objects",
  [FILE_KIND.SOURCE_DATASET]: "Source datasets",
};

export const VERDICT_LABEL: Record<Verdict, string> = {
  [VERDICT.NEEDS_WORK]: "Needs work",
  [VERDICT.NOT_STARTED]: "Not started",
  [VERDICT.PUBLISHING_STEPS]: "Publishing steps left",
  [VERDICT.READY]: "Publish ready",
};

export const VERDICT_COLOR: Record<Verdict, ChipProps["color"]> = {
  [VERDICT.NEEDS_WORK]: "error",
  [VERDICT.NOT_STARTED]: "default",
  [VERDICT.PUBLISHING_STEPS]: CHIP_PROPS.COLOR.CAUTION,
  [VERDICT.READY]: "success",
};

export const VERDICTS: Verdict[] = [
  VERDICT.READY,
  VERDICT.PUBLISHING_STEPS,
  VERDICT.NEEDS_WORK,
  VERDICT.NOT_STARTED,
];

export const PUBLISHING_STEP_LABEL = "Publishing step";

export const PUBLISHING_STEPS_NOTE =
  "Our own publishing steps, not work for the atlas team. A file is not publish ready until they are done.";

export const FILE_QUERY_PARAM = "file";
