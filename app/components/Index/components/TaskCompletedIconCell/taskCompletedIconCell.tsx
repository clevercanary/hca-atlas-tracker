import { ErrorIcon } from "@clevercanary/data-explorer-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { SuccessIcon } from "@clevercanary/data-explorer-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { Fragment } from "react";

interface TaskCompletedIconCellProps {
  value: string;
}

export const TaskCompletedIconCell = ({
  value,
}: TaskCompletedIconCellProps): JSX.Element => {
  return (
    <Fragment>
      {value === "yes" ? (
        <SuccessIcon color="success" fontSize="small" />
      ) : (
        <ErrorIcon color="warning" fontSize="small" />
      )}
    </Fragment>
  );
};
