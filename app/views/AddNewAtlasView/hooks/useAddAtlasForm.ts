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

/**
 * Returns schema default values.
 * @returns schema default values.
 */
function mapSchemaValues(): Partial<NewAtlasData> {
  return {
    integrationLead: [
      {
        email: "",
        name: "",
      },
    ],
  };
}

/**
 * Returns API payload mapped from data.
 * @param data - Form data.
 * @param data.doi - DOI.
 * @returns API payload.
 */
function mapApiValues({ doi, ...data }: NewAtlasData): APINewAtlasData {
  return {
    ...data,
    capId: null,
    dois: doi ? [doi] : undefined,
  };
}
