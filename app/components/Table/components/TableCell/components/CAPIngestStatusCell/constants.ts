import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { ChipProps } from "@mui/material";
import { CAP_INGEST_STATUS } from "./entities";

export const CAP_INGEST_STATUS_COLOR: Record<
  CAP_INGEST_STATUS,
  ChipProps["color"]
> = {
  CAP_READY: CHIP_PROPS.COLOR.SUCCESS,
  NEEDS_VALIDATION: CHIP_PROPS.COLOR.WARNING,
  NOT_REQUIRED: CHIP_PROPS.COLOR.DEFAULT,
  UPDATES_REQUIRED: CHIP_PROPS.COLOR.ERROR,
};

export const CAP_INGEST_STATUS_LABEL: Record<CAP_INGEST_STATUS, string> = {
  CAP_READY: "CAP Ready",
  NEEDS_VALIDATION: "Needs Validation",
  NOT_REQUIRED: "Not Required",
  UPDATES_REQUIRED: "Updates Required",
};
