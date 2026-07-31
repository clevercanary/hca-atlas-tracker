import { HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { useForm } from "@/app/hooks/useForm/useForm";
import { NewSourceStudyData } from "@/app/views/AddNewSourceStudyView/common/entities";
import { newSourceStudySchema } from "@/app/views/AddNewSourceStudyView/common/schema";

const SCHEMA = newSourceStudySchema;

export const useAddSourceStudyForm = (): FormMethod<
  NewSourceStudyData,
  HCAAtlasTrackerSourceStudy
> => {
  return useForm<NewSourceStudyData, HCAAtlasTrackerSourceStudy>(SCHEMA);
};
