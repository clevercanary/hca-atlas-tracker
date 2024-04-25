import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { Fragment } from "react";
import { RequiredIcon } from "../../../../../common/CustomIcon/components/RequiredIcon/requiredIcon";

export enum TASK_STATUS {
  DONE = "Yes",
  REQUIRED = "No",
}

interface TaskStatusCellProps {
  value: string;
}

export const TaskStatusCell = ({ value }: TaskStatusCellProps): JSX.Element => {
  return <Fragment>{switchTaskStatusIcon(value)}</Fragment>;
};

/**
 * Switch task status icon for the given value.
 * @param value - Task value.
 * @returns icon element for the task status value.
 */
function switchTaskStatusIcon(value: string): JSX.Element {
  switch (value) {
    case TASK_STATUS.DONE:
      return <SuccessIcon color="success" fontSize="small" />;
    case TASK_STATUS.REQUIRED:
      return <RequiredIcon />;
    default:
      return <span>-</span>;
  }
}
