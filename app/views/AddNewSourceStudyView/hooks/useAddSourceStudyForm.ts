import { HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { useForm } from "@/app/hooks/useForm/useForm";
import { NewSourceStudyData } from "../common/entities";
import { newSourceStudySchema } from "../common/schema";

const SCHEMA = newSourceStudySchema;

export const useAddSourceStudyForm = (): FormMethod<
  NewSourceStudyData,
  HCAAtlasTrackerSourceStudy
> => {
  return useForm<NewSourceStudyData, HCAAtlasTrackerSourceStudy>(SCHEMA);
};
