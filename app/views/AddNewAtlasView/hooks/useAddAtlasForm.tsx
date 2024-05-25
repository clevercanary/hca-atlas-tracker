import { NewAtlasData as APINewAtlasData } from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { NewAtlasData } from "../common/entities";
import { newAtlasSchema } from "../common/schema";

const SCHEMA = newAtlasSchema;

export const useAddAtlasForm = (): FormMethod<NewAtlasData> => {
  return useForm<NewAtlasData>(SCHEMA, undefined, undefined, mapApiValues);
};

/**
 * Returns API payload mapped from from data.
 * @param data - Form data.
 * @returns API payload.
 */
function mapApiValues(data: NewAtlasData): APINewAtlasData {
  const integrationLead = [data.integrationLeadA];
  if (data.integrationLeadB.name) integrationLead.push(data.integrationLeadB);
  return {
    ...data,
    integrationLead,
  };
}
