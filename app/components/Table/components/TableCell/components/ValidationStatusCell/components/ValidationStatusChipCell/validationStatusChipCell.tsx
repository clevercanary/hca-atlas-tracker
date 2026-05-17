import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/chipCell";
import { ChipProps } from "@mui/material";
import { JSX } from "react";
import { buildValidationStatusChipCell } from "./utils";

export const ValidationStatusChipCell = (
  props: Pick<ChipProps, "color" | "label">,
): JSX.Element | null => {
  return <ChipCell {...buildValidationStatusChipCell(props)} />;
};
