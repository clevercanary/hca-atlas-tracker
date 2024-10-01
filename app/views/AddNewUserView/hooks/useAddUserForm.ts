import {
  HCAAtlasTrackerUser,
  ROLE,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { NewUserData } from "../common/entities";
import { newUserSchema } from "../common/schema";

const SCHEMA = newUserSchema;

export const useAddUserForm = (): FormMethod<
  NewUserData,
  HCAAtlasTrackerUser
> => {
  return useForm<NewUserData, HCAAtlasTrackerUser>(
    SCHEMA,
    undefined,
    mapSchemaValues
  );
};

function mapSchemaValues(data?: NewUserData): NewUserData {
  return {
    disabled: data?.disabled ?? false,
    email: data?.email ?? "",
    fullName: data?.fullName ?? "",
    role: data?.role ?? ROLE.STAKEHOLDER,
    roleAssociatedResourceIds: data?.roleAssociatedResourceIds ?? [],
  };
}
