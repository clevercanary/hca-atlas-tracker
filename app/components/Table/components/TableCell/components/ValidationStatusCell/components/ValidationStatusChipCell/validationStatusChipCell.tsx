import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/chipCell";
import { ChipProps, Tooltip } from "@mui/material";
import { JSX } from "react";
import { buildValidationStatusChipCell } from "./utils";

interface Props extends Pick<ChipProps, "color" | "label"> {
  errorMessage: string | null;
}

export const ValidationStatusChipCell = ({
  errorMessage,
  ...chipProps
}: Props): JSX.Element | null => {
  return (
    <Tooltip
      arrow
      disableInteractive={false}
      placement="right"
      title={errorMessage}
    >
      {/* The span here serves as a wrapper that can receive the ref provided by `Tooltip` */}
      <span>
        <ChipCell {...buildValidationStatusChipCell(chipProps)} />
      </span>
    </Tooltip>
  );
};
