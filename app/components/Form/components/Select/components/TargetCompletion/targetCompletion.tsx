import { MenuItem as MMenuItem } from "@mui/material";
import { JSX, forwardRef, ReactNode, useMemo } from "react";
import { getPastAndNextTwoYearsQuartersByDate } from "../../../../../../utils/date-fns";
import {
  Select,
  SelectProps,
} from "../../../../../common/Form/components/Select/select";
import { TARGET_COMPLETION_NULL } from "./common/constants";

export const TargetCompletion = forwardRef<HTMLInputElement, SelectProps>(
  function TargetCompletion(
    {
      className,
      ...props /* Spread props to allow for Mui SelectProps specific prop overrides and controller related props e.g. "field". */
    }: SelectProps,
    ref,
  ): JSX.Element {
    const quartersByDate = useMemo(
      () => getPastAndNextTwoYearsQuartersByDate(),
      [],
    );
    return (
      <Select
        {...props}
        className={className}
        ref={ref}
        renderValue={(value): ReactNode => renderValue(value, quartersByDate)}
      >
        {[...quartersByDate].map(([date, quarter]) => (
          <MMenuItem key={quarter} value={date}>
            {quarter}
          </MMenuItem>
        ))}
        <MMenuItem value={TARGET_COMPLETION_NULL}>Unplanned</MMenuItem>
      </Select>
    );
  },
);

/**
 * Renders select value.
 * @param value - Select value.
 * @param futureQuarterByDate - Future quarter keyed by date.
 * @returns select value.
 */
function renderValue(
  value: unknown,
  futureQuarterByDate: Map<string, string>,
): ReactNode {
  if (value && typeof value === "string") {
    if (value === TARGET_COMPLETION_NULL) return "Unplanned";
    if (futureQuarterByDate.has(value)) {
      return futureQuarterByDate.get(value);
    }
  }
  return "Choose...";
}
