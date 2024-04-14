import { SuccessIcon } from "@clevercanary/data-explorer-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { Fragment } from "react";
import { RequiredIcon } from "../../../common/CustomIcon/components/RequiredIcon/requiredIcon";

interface TaskStatusCellProps {
  done: boolean;
}

export const TaskStatusCell = ({ done }: TaskStatusCellProps): JSX.Element => {
  return <Fragment>{switchTaskStatusIcon(done)}</Fragment>;
};

/**
 * Switch task status icon for the given value.
 * @param value - Task done value.
 * @returns icon element for the task status value.
 */
function switchTaskStatusIcon(value: boolean): JSX.Element {
  return value ? (
    <SuccessIcon color="success" fontSize="small" />
  ) : (
    <RequiredIcon />
  );
}
