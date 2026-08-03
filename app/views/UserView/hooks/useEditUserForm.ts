import {
  type HCAAtlasTrackerUser,
  ROLE,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type UserEditData as ApiUserEditData } from "@/app/apis/catalog/hca-atlas-tracker/common/schema";
import { type PathParameter } from "@/app/common/entities";
import { useFetchUser } from "@/app/hooks/UseFetchUser/hook";
import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { useForm } from "@/app/hooks/useForm/useForm";
import { FIELD_NAME } from "@/app/views/UserView/common/constants";
import { type UserEditData } from "@/app/views/UserView/common/entities";
import { userEditSchema } from "@/app/views/UserView/common/schema";

const SCHEMA = userEditSchema;

export const useEditUserForm = (
  pathParameter: PathParameter,
): FormMethod<UserEditData, HCAAtlasTrackerUser> => {
  const { data: user } = useFetchUser(pathParameter);
  return useForm<UserEditData, HCAAtlasTrackerUser>(
    SCHEMA,
    user,
    mapSchemaValues,
    mapApiValues,
  );
};

/**
 * Returns schema default values mapped from user.
 * @param user - User.
 * @returns schema default values.
 */
function mapSchemaValues(user?: HCAAtlasTrackerUser): UserEditData {
  return {
    [FIELD_NAME.DISABLED]: user?.disabled ? "disabled" : "enabled",
    [FIELD_NAME.EMAIL]: user?.email ?? "",
    [FIELD_NAME.FULL_NAME]: user?.fullName ?? "",
    [FIELD_NAME.ROLE]: user?.role ?? ROLE.STAKEHOLDER,
    [FIELD_NAME.ROLE_ASSOCIATED_RESOURCE_IDS]:
      user?.roleAssociatedResourceIds ?? [],
  };
}

function mapApiValues(user: UserEditData): ApiUserEditData {
  return {
    ...user,
    disabled: user.disabled === "disabled",
    roleAssociatedResourceIds:
      user.role === ROLE.INTEGRATION_LEAD ? user.roleAssociatedResourceIds : [],
  };
}
