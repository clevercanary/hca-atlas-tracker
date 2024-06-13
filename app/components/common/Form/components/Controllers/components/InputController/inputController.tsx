import { OutlinedInputProps as MOutlinedInputProps } from "@mui/material/OutlinedInput/OutlinedInput";
import { Controller, FieldValues, UseControllerProps } from "react-hook-form";
import {
  FormMethod,
  YupValidatedFormValues,
} from "../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../hooks/useFormManager/common/entities";
import { Input } from "../../../Input/input";

export interface InputControllerProps<T extends FieldValues, R = undefined>
  extends UseControllerProps<YupValidatedFormValues<T>> {
  className?: string;
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
  inputProps?: Partial<Omit<MOutlinedInputProps, "ref">>;
}

export const InputController = <T extends FieldValues, R = undefined>({
  className,
  formManager,
  formMethod,
  inputProps,
  name,
  ...props
}: InputControllerProps<T, R>): JSX.Element => {
  const {
    formStatus: { isReadOnly },
  } = formManager;
  const { control } = formMethod;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error, invalid } }): JSX.Element => (
        <Input
          {...field}
          className={className}
          error={invalid}
          helperText={error?.message}
          isFilled={Boolean(field.value)}
          readOnly={isReadOnly}
          {...inputProps}
          {...props}
        />
      )}
    />
  );
};
