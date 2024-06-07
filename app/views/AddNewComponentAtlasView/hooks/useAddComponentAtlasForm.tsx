import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { NewComponentAtlasData } from "../common/entities";
import { newComponentAtlasSchema } from "../common/schema";

const SCHEMA = newComponentAtlasSchema;

export const useAddComponentAtlasForm = (): FormMethod<
  NewComponentAtlasData,
  HCAAtlasTrackerComponentAtlas
> => {
  return useForm<NewComponentAtlasData, HCAAtlasTrackerComponentAtlas>(SCHEMA);
};
