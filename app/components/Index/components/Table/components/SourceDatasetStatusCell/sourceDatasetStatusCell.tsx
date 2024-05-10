import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { Fragment } from "react";
import { RequiredIcon } from "../../../../../common/CustomIcon/components/RequiredIcon/requiredIcon";

export enum SOURCE_DATASET_STATUS {
  DONE = "Yes",
  REQUIRED = "No",
}

interface SourceDatasetStatusCellProps {
  value: string;
}

export const SourceDatasetStatusCell = ({
  value,
}: SourceDatasetStatusCellProps): JSX.Element => {
  return <Fragment>{switchStatusIcon(value)}</Fragment>;
};

/**
 * Switch status icon for the given value.
 * @param value - Task value.
 * @returns icon element for the status value.
 */
function switchStatusIcon(value: string): JSX.Element {
  switch (value) {
    case SOURCE_DATASET_STATUS.DONE:
      return <SuccessIcon color="success" fontSize="small" />;
    case SOURCE_DATASET_STATUS.REQUIRED:
      return <RequiredIcon />;
    default:
      return <span>-</span>;
  }
}
