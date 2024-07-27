import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { Fragment } from "react";
import { RequiredIcon } from "../../../../../common/CustomIcon/components/RequiredIcon/requiredIcon";

export enum SOURCE_STUDY_STATUS {
  DONE = "Yes",
  IN_PROGRESS = "In progress",
  REQUIRED = "No",
}

interface SourceStudyStatusCellProps {
  value: string;
}

export const SourceStudyStatusCell = ({
  value,
}: SourceStudyStatusCellProps): JSX.Element => {
  return <Fragment>{switchStatusIcon(value)}</Fragment>;
};

/**
 * Switch status icon for the given value.
 * @param value - Task value.
 * @returns icon element for the status value.
 */
function switchStatusIcon(value: string): JSX.Element {
  switch (value) {
    case SOURCE_STUDY_STATUS.DONE:
      return <SuccessIcon color="success" fontSize="small" />;
    case SOURCE_STUDY_STATUS.IN_PROGRESS:
      return <SuccessIcon color="warning" fontSize="small" />;
    case SOURCE_STUDY_STATUS.REQUIRED:
      return <RequiredIcon />;
    default:
      return <span>-</span>;
  }
}
