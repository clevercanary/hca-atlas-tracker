import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { useForm } from "@/app/hooks/useForm/useForm";
import { type PublicationStatusEditData } from "@/app/views/AtlasSourceDatasetsView/components/Table/components/RowSelection/components/EditSelection/components/EditPublicationStatus/common/entities";
import { publicationStatusEditSchema } from "@/app/views/AtlasSourceDatasetsView/components/Table/components/RowSelection/components/EditSelection/components/EditPublicationStatus/common/schema";

const SCHEMA = publicationStatusEditSchema;

export const useEditPublicationStatusForm =
  (): FormMethod<PublicationStatusEditData> => {
    return useForm<PublicationStatusEditData>(SCHEMA);
  };
