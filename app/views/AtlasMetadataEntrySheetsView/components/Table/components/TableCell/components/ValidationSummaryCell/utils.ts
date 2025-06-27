import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { ChipProps } from "@mui/material";

/**
 * Returns the color for the MuiChip component.
 * @param errorCount - Error count.
 * @returns Chip color.
 */
export function getErrorCountColor(errorCount: number): ChipProps["color"] {
  switch (errorCount) {
    case 0:
      return CHIP_PROPS.COLOR.SUCCESS;
    case 1:
      return CHIP_PROPS.COLOR.WARNING;
    default:
      return CHIP_PROPS.COLOR.ERROR;
  }
}

/**
 * Returns the label for the MuiChip component.
 * @param errorCount - Error count.
 * @returns Chip label.
 */
export function getErrorCountLabel(errorCount: number): ChipProps["label"] {
  switch (errorCount) {
    case 0:
      return "Valid";
    case 1:
      return `${errorCount} error`;
    default:
      return `${errorCount} errors`;
  }
}

/**
 * Returns the icon for the MuiChip component.
 * @param errorCount - Error count.
 * @returns Chip icon.
 */
export function getErrorCountIcon(errorCount: number): ChipProps["icon"] {
  switch (errorCount) {
    case 0:
      return SuccessIcon({});
    case 1:
      return ErrorIcon({});
    default:
      return ErrorIcon({});
  }
}
