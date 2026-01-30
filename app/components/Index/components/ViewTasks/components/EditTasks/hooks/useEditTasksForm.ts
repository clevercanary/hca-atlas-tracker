import { FieldValues } from "react-hook-form";
import { ObjectSchema } from "yup";
import { HCAAtlasTrackerValidationRecord } from "../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  FormMethod,
  MapApiValuesFn,
} from "../../../../../../../hooks/useForm/common/entities";
import { useForm } from "../../../../../../../hooks/useForm/useForm";

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
