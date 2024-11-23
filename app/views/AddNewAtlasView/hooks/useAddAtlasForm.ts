import { HCAAtlasTrackerAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { NewAtlasData as APINewAtlasData } from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { NewAtlasData } from "../common/entities";
import { newAtlasSchema } from "../common/schema";

const SCHEMA = newAtlasSchema;

export const useAddAtlasForm = (): FormMethod<
  NewAtlasData,
  HCAAtlasTrackerAtlas
> => {
  return useForm<NewAtlasData, HCAAtlasTrackerAtlas>(
    SCHEMA,
    undefined,
    mapSchemaValues,
    mapApiValues
  );
};

function mapSchemaValues(): NewAtlasData {
  return {
    integrationLead: [
      {
        email: "",
        name: "",
      },
    ],
  } as NewAtlasData; // TODO might be good to make this not requred
}

/**
 * Returns API payload mapped from data.
 * @param data - Form data.
 * @returns API payload.
 */
function mapApiValues(data: NewAtlasData): APINewAtlasData {
  return {
    ...data,
    integrationLead: data.integrationLead,
  };
}
