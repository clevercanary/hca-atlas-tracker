import { MenuItem as MMenuItem } from "@mui/material";
import { ReactNode, useEffect, useMemo } from "react";
import { Controller as FormController } from "react-hook-form";
import { getFutureQuarterByDateForNextTwoYears } from "../../../../../../../../../../../../utils/date-fns";
import { ContentProps } from "../../../../../../common/entities";
import { DEFAULT_INPUT_PROPS, FIELD_NAME } from "../../../../common/constants";
import { TaskCompletionDatesData } from "../../../../common/entities";
import { Select } from "./content.styles";

export const Content = ({
  formMethod,
  taskIds,
}: ContentProps<TaskCompletionDatesData>): JSX.Element => {
  const {
    control,
    formState: { errors },
    setValue,
  } = formMethod;
  const futureQuarterByDate = useMemo(
    () => getFutureQuarterByDateForNextTwoYears(),
    []
  );

  useEffect(() => {
    setValue(FIELD_NAME.TASK_IDS, taskIds);
  }, [setValue, taskIds]);

  return (
    <FormController
      control={control}
      name={FIELD_NAME.TARGET_COMPLETION}
      render={({ field }): JSX.Element => (
        <Select
          {...field}
          {...DEFAULT_INPUT_PROPS.TARGET_COMPLETION}
          displayEmpty
          error={Boolean(errors[FIELD_NAME.TARGET_COMPLETION])}
          helperText={errors[FIELD_NAME.TARGET_COMPLETION]?.message as string}
          isFilled={Boolean(field.value)}
          renderValue={(value): ReactNode =>
            renderSelectValue(value, futureQuarterByDate)
          }
        >
          {[...futureQuarterByDate].map(([date, quarter]) => (
            <MMenuItem key={quarter} value={date}>
              {quarter}
            </MMenuItem>
          ))}
        </Select>
      )}
    />
  );
};

/**
 * Renders select value.
 * @param value - Select value.
 * @param futureQuarterByDate - Future quarter keyed by date.
 * @returns select value.
 */
function renderSelectValue(
  value: unknown,
  futureQuarterByDate: Map<string, string>
): ReactNode {
  if (value && typeof value === "string" && futureQuarterByDate.has(value)) {
    return futureQuarterByDate.get(value);
  }
  return "Choose...";
}
