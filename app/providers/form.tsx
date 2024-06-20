import { createContext, ReactNode } from "react";
import { FieldValues } from "react-hook-form";
import { FormMethod } from "../hooks/useForm/common/entities";
import { FormManager } from "../hooks/useFormManager/common/entities";

type FormData = Record<string, unknown>;

export interface FormContextProps<
  D extends FormData = FormData,
  T extends FieldValues = FieldValues,
  R = unknown
> {
  data?: D;
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
}

export const FormContext = createContext<FormContextProps>({
  data: undefined,
  formManager: {} as FormManager,
  formMethod: {} as FormMethod<FieldValues>,
});

interface Props<
  D extends FormData = FormData,
  T extends FieldValues = FieldValues,
  R = unknown
> {
  children: ReactNode | ReactNode[];
  data?: D;
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
}

export function FormProvider<
  D extends FormData,
  T extends FieldValues,
  R = unknown
>({ children, data, formManager, formMethod }: Props<D, T, R>): JSX.Element {
  return (
    <FormContext.Provider value={{ data, formManager, formMethod }}>
      {children}
    </FormContext.Provider>
  );
}
