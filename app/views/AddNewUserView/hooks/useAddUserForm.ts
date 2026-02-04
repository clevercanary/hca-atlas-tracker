import {
  HCAAtlasTrackerUser,
  ROLE,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { NewUserData as ApiNewUserData } from "../../../apis/catalog/hca-atlas-tracker/common/schema";
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
    mapSchemaValues,
    mapApiValues,
  );
};

function mapSchemaValues(data?: ApiNewUserData): NewUserData {
  return {
    disabled: data?.disabled ? "disabled" : "enabled",
    email: data?.email ?? "",
    fullName: data?.fullName ?? "",
    role: data?.role ?? ROLE.STAKEHOLDER,
    roleAssociatedResourceIds: data?.roleAssociatedResourceIds ?? [],
  };
}

function mapApiValues(user: NewUserData): ApiNewUserData {
  return {
    ...user,
    disabled: user.disabled === "disabled",
    roleAssociatedResourceIds:
      user.role === ROLE.INTEGRATION_LEAD ? user.roleAssociatedResourceIds : [],
  };
}
