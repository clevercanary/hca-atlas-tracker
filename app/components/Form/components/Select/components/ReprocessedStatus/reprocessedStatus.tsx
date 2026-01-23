import { MenuItem as MMenuItem } from "@mui/material";
import { forwardRef, ReactNode } from "react";
import { REPROCESSED_STATUS } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  Select,
  SelectProps,
} from "../../../../../common/Form/components/Select/select";

export const ReprocessedStatus = forwardRef<HTMLInputElement, SelectProps>(
  function ReprocessedStatus(
    { className, ...props }: SelectProps,
    ref,
  ): JSX.Element {
    return (
      <Select
        {...props}
        className={className}
        ref={ref}
        renderValue={renderValue}
      >
        {Object.values(REPROCESSED_STATUS).map((status) => {
          return (
            <MMenuItem key={status} value={status}>
              {status}
            </MMenuItem>
          );
        })}
      </Select>
    );
  },
);

/**
 * Renders select value.
 * @param value - Select value.
 * @returns select value.
 */
function renderValue(value: unknown): ReactNode {
  if (value && typeof value === "string") return value;
  return "Choose...";
}
