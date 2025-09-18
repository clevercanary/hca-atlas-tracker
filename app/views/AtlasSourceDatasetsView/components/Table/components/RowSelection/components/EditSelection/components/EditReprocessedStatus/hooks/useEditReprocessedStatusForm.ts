import { FormMethod } from "../../../../../../../../../../../hooks/useForm/common/entities";
import { useForm } from "../../../../../../../../../../../hooks/useForm/useForm";
import { ReprocessedStatusEditData } from "../common/entities";
import { reprocessedStatusEditSchema } from "../common/schema";

const SCHEMA = reprocessedStatusEditSchema;

export const useEditReprocessedStatusForm =
  (): FormMethod<ReprocessedStatusEditData> => {
    return useForm<ReprocessedStatusEditData>(SCHEMA);
  };
