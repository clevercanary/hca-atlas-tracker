import { FieldValues, UseFormReturn } from "react-hook-form";
import { UseFormReset } from "react-hook-form/dist/types/form";
import { InferType, ObjectSchema } from "yup";
import { METHOD } from "../../../common/entities";
import { UseForm } from "../useForm";

export type CustomUseFormReturn<T extends FieldValues> = UseFormReturn<
  YupValidatedFormValues<T>
>;

export type FormMethod<T extends FieldValues, R = undefined> = UseForm<T, R>;

/**
 * JSON body of an error response from an API; may contain a single `message` string, or an `errors` object indexed by field name.
 */
export type FormResponseErrors =
  | { message: string }
  | { errors: Record<string, string[]> };

export type MapApiValuesFn<T extends FieldValues> = (
  formData: YupValidatedFormValues<T>
) => unknown;

export type MapSchemaValuesFn<T, R> = (apiData?: R) => T | undefined;

export type OnDeleteFn = (
  requestURL: string,
  requestMethod: METHOD,
  options?: OnDeleteOptions
) => Promise<void>;

export interface OnDeleteOptions {
  onSuccess?: (id: string) => void;
}

export type OnSubmitFn<T extends FieldValues, R = undefined> = (
  requestURL: string,
  requestMethod: METHOD,
  payload: YupValidatedFormValues<T>,
  options?: OnSubmitOptions<T, R>
) => Promise<void>;

export interface OnSubmitOptions<T extends FieldValues, R = undefined> {
  onReset?: UseFormReset<YupValidatedFormValues<T>>;
  onSuccess?: (response: R) => void;
}

export type YupValidatedFormValues<T extends FieldValues> = InferType<
  ObjectSchema<T>
>;
