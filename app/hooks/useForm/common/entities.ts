import { FieldValues, UseFormReturn } from "react-hook-form";
import { InferType, ObjectSchema } from "yup";
import { METHOD } from "../../../common/entities";
import { UseForm } from "../useForm";

export type CustomUseFormReturn<T extends FieldValues> = Pick<
  UseFormReturn<YupValidatedFormValues<T>>,
  "control" | "formState" | "handleSubmit"
>;

export type FormMethod<T extends FieldValues, R = undefined> = UseForm<T, R>;

export type MapSchemaValuesFn<T, R> = (apiData?: R) => T | undefined;

export type OnDeleteFn = (
  requestURL: string,
  requestMethod: METHOD,
  options?: OnDeleteOptions
) => Promise<void>;

export interface OnDeleteOptions {
  onSuccess?: (id: string) => void;
}

export type OnSubmitFn<T extends FieldValues> = (
  requestURL: string,
  requestMethod: METHOD,
  payload: YupValidatedFormValues<T>,
  options?: OnSubmitOptions
) => Promise<void>;

export interface OnSubmitOptions {
  onSuccess?: (id: string) => void;
}

export type YupValidatedFormValues<T extends FieldValues> = InferType<
  ObjectSchema<T>
>;
