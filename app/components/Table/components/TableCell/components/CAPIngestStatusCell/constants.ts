import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { ChipProps } from "@mui/material";
import { CAP_INGEST_STATUS } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { CHIP_PROPS as APP_CHIP_PROPS } from "../../../../../../styles/common/mui/chip";

export const CAP_INGEST_STATUS_COLOR: Record<
  CAP_INGEST_STATUS,
  ChipProps["color"]
> = {
  CAP_READY: CHIP_PROPS.COLOR.SUCCESS,
  CAP_VALIDATION_FAILED: CHIP_PROPS.COLOR.ERROR,
  INFO_REQUIRED: CHIP_PROPS.COLOR.WARNING,
  NEEDS_VALIDATION: CHIP_PROPS.COLOR.WARNING,
  NOT_REQUIRED: CHIP_PROPS.COLOR.DEFAULT,
  PUBLISHED: APP_CHIP_PROPS.COLOR.SUCCESS_DARK,
};

export const CAP_INGEST_STATUS_LABEL: Record<CAP_INGEST_STATUS, string> = {
  CAP_READY: "CAP Ready",
  CAP_VALIDATION_FAILED: "CAP Validation Failed",
  INFO_REQUIRED: "Info Required",
  NEEDS_VALIDATION: "Needs Validation",
  NOT_REQUIRED: "Not Required",
  PUBLISHED: "Published",
};

export const CAP_INGEST_STATUS_TOOLTIP: Partial<
  Record<CAP_INGEST_STATUS, string>
> = {
  INFO_REQUIRED: "Set the Reprocessed Status to continue",
};
