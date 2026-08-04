import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { useForm } from "@/app/hooks/useForm/useForm";
import { type SourceStudyEditData } from "@/app/views/AtlasSourceDatasetsView/components/Table/components/RowSelection/components/EditSelection/components/SetSourceStudy/common/entities";
import { sourceStudyEditSchema } from "@/app/views/AtlasSourceDatasetsView/components/Table/components/RowSelection/components/EditSelection/components/SetSourceStudy/common/schema";

const SCHEMA = sourceStudyEditSchema;

export const useEditSourceStudyForm = (): FormMethod<SourceStudyEditData> => {
  return useForm<SourceStudyEditData>(SCHEMA);
};
