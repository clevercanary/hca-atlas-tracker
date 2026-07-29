import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { useForm } from "@/app/hooks/useForm/useForm";
import { PublicationStatusEditData } from "../common/entities";
import { publicationStatusEditSchema } from "../common/schema";

const SCHEMA = publicationStatusEditSchema;

export const useEditPublicationStatusForm =
  (): FormMethod<PublicationStatusEditData> => {
    return useForm<PublicationStatusEditData>(SCHEMA);
  };
