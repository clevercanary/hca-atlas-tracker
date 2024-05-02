import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { NewSourceDatasetData } from "../common/entities";
import { newSourceDatasetSchema } from "../common/schema";

const SCHEMA = newSourceDatasetSchema;

export const useAddSourceDatasetForm = (): FormMethod<NewSourceDatasetData> => {
  return useForm<NewSourceDatasetData>(SCHEMA);
};
