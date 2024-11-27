import { HCAAtlasTrackerAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
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
    mapSchemaValues
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
