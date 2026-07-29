import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { useForm } from "@/app/hooks/useForm/useForm";
import { SourceStudyEditData } from "../common/entities";
import { sourceStudyEditSchema } from "../common/schema";

const SCHEMA = sourceStudyEditSchema;

export const useEditSourceStudyForm = (): FormMethod<SourceStudyEditData> => {
  return useForm<SourceStudyEditData>(SCHEMA);
};
