import { FieldValues } from "react-hook-form";
import { ObjectSchema } from "yup";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  FormMethod,
  MapSchemaValuesFn,
} from "../../../../../../../../../hooks/useForm/common/entities";
import { useForm } from "../../../../../../../../../hooks/useForm/useForm";

export const useSourceDatasetForm = <T extends FieldValues>(
  schema: ObjectSchema<T>,
  apiData?: HCAAtlasTrackerSourceDataset,
  mapSchemaValues?: MapSchemaValuesFn<T, HCAAtlasTrackerSourceDataset>
): FormMethod<T, HCAAtlasTrackerSourceDataset> => {
  return useForm<T, HCAAtlasTrackerSourceDataset>(
    schema,
    apiData,
    mapSchemaValues
  );
};
