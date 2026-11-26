import { ALERT_PROPS as DX_ALERT_PROPS } from "@databiosphere/findable-ui/lib/components/common/Alert/constants";
import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { SIZE } from "@databiosphere/findable-ui/lib/styles/common/constants/size";
import { type AlertProps, type ChipProps } from "@mui/material";
import {
  FILE_KIND,
  type FileKind,
  OWNER,
  type Owner,
  PRIORITY,
  type Priority,
  VERDICT,
  type Verdict,
} from "./types";

export const ALERT_PROPS: AlertProps = {
  ...DX_ALERT_PROPS.STANDARD_INFO,
  component: FluidPaper,
  size: SIZE.LARGE,
};

// The shared-issues list shows the most urgent and widespread issues; the
// files table holds the rest.
export const SHARED_ISSUE_LIMIT = 10;

export const PRIORITIES: Priority[] = [
  PRIORITY.HIGH,
  PRIORITY.MEDIUM,
  PRIORITY.LOW,
];

export const PRIORITY_BORDER: Record<Priority, string> = {
  [PRIORITY.HIGH]: PALETTE.ALERT_MAIN,
  [PRIORITY.LOW]: PALETTE.SMOKE_DARK,
  [PRIORITY.MEDIUM]: PALETTE.WARNING_MAIN,
};

export const PRIORITY_CHIP: Record<Priority, ChipProps["color"]> = {
  [PRIORITY.HIGH]: "error",
  [PRIORITY.LOW]: "default",
  [PRIORITY.MEDIUM]: "caution",
};

export const VERDICT_CHIP: Record<Verdict, ChipProps["color"]> = {
  [VERDICT.NEEDS_WORK]: "error",
  [VERDICT.NOT_STARTED]: "default",
  [VERDICT.READY]: "success",
};

export const VERDICT_LABEL: Record<Verdict, string> = {
  [VERDICT.NEEDS_WORK]: "Needs work",
  [VERDICT.NOT_STARTED]: "Not started",
  [VERDICT.READY]: "Ready",
};

export const OWNER_LABEL: Record<Owner, string> = {
  [OWNER.CURATION_TOOL]: "Curation tool",
  [OWNER.PRODUCER]: "Producer",
  [OWNER.WRANGLER]: "Wrangler",
};

export const FILE_KIND_LABEL: Record<FileKind, string> = {
  [FILE_KIND.INTEGRATED_OBJECT]: "Integrated object",
  [FILE_KIND.SOURCE_DATASET]: "Source dataset",
};
