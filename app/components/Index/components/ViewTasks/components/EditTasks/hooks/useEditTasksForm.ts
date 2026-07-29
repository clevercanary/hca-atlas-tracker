import { HCAAtlasTrackerValidationRecord } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  FormMethod,
  MapApiValuesFn,
} from "@/app/hooks/useForm/common/entities";
import { useForm } from "@/app/hooks/useForm/useForm";
import { FieldValues } from "react-hook-form";
import { ObjectSchema } from "yup";

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
