import { useEffect } from "react";
import { Controller as FormController } from "react-hook-form";
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
          error={Boolean(errors[FIELD_NAME.TARGET_COMPLETION])}
          helperText={errors[FIELD_NAME.TARGET_COMPLETION]?.message as string}
          isFilled={Boolean(field.value)}
        />
      )}
    />
  );
};
