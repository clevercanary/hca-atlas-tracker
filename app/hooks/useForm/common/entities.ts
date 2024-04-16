import { FieldValues, UseFormReturn } from "react-hook-form";
import { InferType, ObjectSchema } from "yup";
import { METHOD } from "../../../common/entities";
import { UseForm } from "../useForm";

export type CustomUseFormReturn<T extends FieldValues> = Pick<
  UseFormReturn<YupValidatedFormValues<T>>,
  "control" | "formState" | "getValues" | "handleSubmit"
>;

export type FormMethod<T extends FieldValues> = UseForm<T>;

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
