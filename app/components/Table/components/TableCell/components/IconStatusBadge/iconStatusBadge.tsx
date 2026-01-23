import { JSX } from "react";
import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { InProgressIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/InProgressIcon/inProgressIcon";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { ChipProps } from "@mui/material";
import { PartiallyCompleteIcon } from "../../../../../common/CustomIcon/components/PartiallyCompleteIcon/partiallyCompleteIcon";
import { RequiredIcon } from "../../../../../common/CustomIcon/components/RequiredIcon/requiredIcon";
import { Badge } from "./iconStatusBadge.styles";

export enum ICON_STATUS {
  BLOCKED = "BLOCKED",
  DONE = "DONE",
  IN_PROGRESS = "IN_PROGRESS",
  PARTIALLY_COMPLETE = "PARTIALLY_COMPLETE",
  REQUIRED = "REQUIRED",
}

export interface IconStatusBadgeProps {
  label: string;
  status: ICON_STATUS;
}

export const IconStatusBadge = ({
  label,
  status,
}: IconStatusBadgeProps): JSX.Element => {
  return (
    <Badge
      icon={switchStatusIcon(status)}
      label={label}
      color={switchStatusBadgeColor(status)}
      variant="status"
    />
  );
};

/**
 * Switch status badge color for the given value.
 * @param value - Status value.
 * @returns status badge color for the status value.
 */
function switchStatusBadgeColor(value: ICON_STATUS): ChipProps["color"] {
  switch (value) {
    case ICON_STATUS.BLOCKED:
      return "error";
    case ICON_STATUS.DONE:
      return "success";
    case ICON_STATUS.IN_PROGRESS:
      return "caution";
    case ICON_STATUS.PARTIALLY_COMPLETE:
      return "warning";
    case ICON_STATUS.REQUIRED:
      return "default";
  }
}

/**
 * Switch status icon for the given value.
 * @param value - Status value.
 * @returns icon element for the status value.
 */
function switchStatusIcon(value: ICON_STATUS): JSX.Element {
  switch (value) {
    case ICON_STATUS.BLOCKED:
      return <ErrorIcon />;
    case ICON_STATUS.DONE:
      return <SuccessIcon />;
    case ICON_STATUS.IN_PROGRESS:
      return <InProgressIcon />;
    case ICON_STATUS.PARTIALLY_COMPLETE:
      return <PartiallyCompleteIcon />;
    case ICON_STATUS.REQUIRED:
      return <RequiredIcon />;
  }
}
