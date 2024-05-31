import { MenuItem as MMenuItem } from "@mui/material";
import { forwardRef, ReactNode } from "react";
import { WAVES } from "../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { isWaveValue } from "../../../../../../apis/catalog/hca-atlas-tracker/common/utils";
import {
  Select,
  SelectProps,
} from "../../../../../common/Form/components/Select/select";

export const Wave = forwardRef<HTMLInputElement, SelectProps>(function Wave(
  {
    className,
    ...props /* Spread props to allow for Mui SelectProps specific prop overrides and controller related props e.g. "field". */
  }: SelectProps,
  ref
): JSX.Element {
  return (
    <Select
      {...props}
      className={className}
      ref={ref}
      renderValue={renderValue}
    >
      {WAVES.map((wave) => {
        return (
          <MMenuItem key={wave} value={wave}>
            {wave}
          </MMenuItem>
        );
      })}
    </Select>
  );
});

/**
 * Renders select value.
 * @param value - Select value.
 * @returns select value.
 */
function renderValue(value: unknown): ReactNode {
  if (isWaveValue(value)) {
    return value;
  }
  return "Choose...";
}
