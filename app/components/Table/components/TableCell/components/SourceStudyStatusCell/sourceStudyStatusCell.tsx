import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { InProgressIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/InProgressIcon/inProgressIcon";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { ChipProps } from "@mui/material";
import { PartiallyCompleteIcon } from "../../../../../common/CustomIcon/components/PartiallyCompleteIcon/partiallyCompleteIcon";
import { RequiredIcon } from "../../../../../common/CustomIcon/components/RequiredIcon/requiredIcon";
import { SourceStudyStatusBadge } from "./sourceStudyStatusCell.styles";

export enum SOURCE_STUDY_STATUS {
  BLOCKED = "BLOCKED",
  DONE = "DONE",
  IN_PROGRESS = "IN_PROGRESS",
  PARTIALLY_COMPLETE = "PARTIALLY_COMPLETE",
  REQUIRED = "REQUIRED",
}

export interface SourceStudyStatusCellProps {
  label: string;
  status: SOURCE_STUDY_STATUS;
}

export const SourceStudyStatusCell = ({
  label,
  status,
}: SourceStudyStatusCellProps): JSX.Element => {
  return (
    <SourceStudyStatusBadge
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
function switchStatusBadgeColor(
  value: SOURCE_STUDY_STATUS
): ChipProps["color"] {
  switch (value) {
    case SOURCE_STUDY_STATUS.BLOCKED:
      return "error";
    case SOURCE_STUDY_STATUS.DONE:
      return "success";
    case SOURCE_STUDY_STATUS.IN_PROGRESS:
      return "caution";
    case SOURCE_STUDY_STATUS.PARTIALLY_COMPLETE:
      return "warning";
    case SOURCE_STUDY_STATUS.REQUIRED:
      return "default";
  }
}

/**
 * Switch status icon for the given value.
 * @param value - Status value.
 * @returns icon element for the status value.
 */
function switchStatusIcon(value: SOURCE_STUDY_STATUS): JSX.Element {
  switch (value) {
    case SOURCE_STUDY_STATUS.BLOCKED:
      return <ErrorIcon />;
    case SOURCE_STUDY_STATUS.DONE:
      return <SuccessIcon />;
    case SOURCE_STUDY_STATUS.IN_PROGRESS:
      return <InProgressIcon />;
    case SOURCE_STUDY_STATUS.PARTIALLY_COMPLETE:
      return <PartiallyCompleteIcon />;
    case SOURCE_STUDY_STATUS.REQUIRED:
      return <RequiredIcon />;
  }
}
