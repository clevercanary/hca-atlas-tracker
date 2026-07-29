import { SelectProps } from "@/app/components/common/Form/components/Select/select";
import {
  FormMethod,
  YupValidatedFormValues,
} from "@/app/hooks/useForm/common/entities";
import { FormManager } from "@/app/hooks/useFormManager/common/entities";
import { ForwardRefExoticComponent, JSX, RefAttributes } from "react";
import { Controller, FieldValues, UseControllerProps } from "react-hook-form";

export interface SelectControllerProps<
  T extends FieldValues,
  R = undefined,
> extends UseControllerProps<YupValidatedFormValues<T>> {
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
  SelectComponent: ForwardRefExoticComponent<
    Omit<SelectProps, "ref"> & RefAttributes<HTMLInputElement>
  >;
  selectProps?: Partial<Omit<SelectProps, "ref">>;
}

export const SelectController = <T extends FieldValues, R = undefined>({
  formManager,
  formMethod,
  name,
  SelectComponent,
  selectProps,
  ...props
}: SelectControllerProps<T, R>): JSX.Element => {
  const {
    formStatus: { isReadOnly },
  } = formManager;
  const { control } = formMethod;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error, invalid } }): JSX.Element => (
        <SelectComponent
          {...field}
          error={invalid}
          helperText={error?.message}
          isFilled={Boolean(field.value)}
          readOnly={isReadOnly}
          {...selectProps}
          {...props}
        />
      )}
    />
  );
};
