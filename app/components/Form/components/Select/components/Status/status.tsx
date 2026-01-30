import { MenuItem as MMenuItem } from "@mui/material";
import { JSX, forwardRef, ReactNode } from "react";
import { ATLAS_STATUS } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  Select,
  SelectProps,
} from "../../../../../common/Form/components/Select/select";

export const Status = forwardRef<HTMLInputElement, SelectProps>(function Status(
  {
    className,
    ...props /* Spread props to allow for Mui SelectProps specific prop overrides and controller related props e.g. "field". */
  }: SelectProps,
  ref,
): JSX.Element {
  return (
    <Select
      {...props}
      className={className}
      ref={ref}
      renderValue={renderValue}
    >
      <MMenuItem value={ATLAS_STATUS.IN_PROGRESS}>In progress</MMenuItem>
      <MMenuItem value={ATLAS_STATUS.OC_ENDORSED}>OC endorsed</MMenuItem>
    </Select>
  );
});

/**
 * Renders select value.
 * @param value - Select value.
 * @returns select value.
 */
function renderValue(value: unknown): ReactNode {
  switch (value) {
    case ATLAS_STATUS.IN_PROGRESS:
      return "In progress";
    case ATLAS_STATUS.OC_ENDORSED:
      return "OC endorsed";
    default:
      return "Choose...";
  }
}
