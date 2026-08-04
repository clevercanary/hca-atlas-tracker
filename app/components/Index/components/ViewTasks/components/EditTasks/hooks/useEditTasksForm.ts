import { type HCAAtlasTrackerValidationRecord } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  type FormMethod,
  type MapApiValuesFn,
} from "@/app/hooks/useForm/common/entities";
import { useForm } from "@/app/hooks/useForm/useForm";
import { type FieldValues } from "react-hook-form";
import { type ObjectSchema } from "yup";

export const useEditTasksForm = <
  T extends FieldValues,
  R extends HCAAtlasTrackerValidationRecord[] =
    HCAAtlasTrackerValidationRecord[],
>(
  schema: ObjectSchema<T>,
  mapApiValues?: MapApiValuesFn<T>,
): FormMethod<T, R> => {
  return useForm<T, R>(schema, undefined, undefined, mapApiValues);
};
