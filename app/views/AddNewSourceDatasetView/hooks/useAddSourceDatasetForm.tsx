import { HCAAtlasTrackerSourceStudy } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { NewSourceStudyData } from "../common/entities";
import { newSourceStudySchema } from "../common/schema";

const SCHEMA = newSourceStudySchema;

export const useAddSourceStudyForm = (): FormMethod<
  NewSourceStudyData,
  HCAAtlasTrackerSourceStudy
> => {
  return useForm<NewSourceStudyData, HCAAtlasTrackerSourceStudy>(SCHEMA);
};
