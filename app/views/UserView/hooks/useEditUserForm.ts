import {
  HCAAtlasTrackerUser,
  ROLE,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { UserEditData as ApiUserEditData } from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { PathParameter } from "../../../common/entities";
import { useFetchUser } from "../../../hooks/useFetchUser";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { FIELD_NAME } from "../common/constants";
import { UserEditData } from "../common/entities";
import { userEditSchema } from "../common/schema";

const SCHEMA = userEditSchema;

export const useEditUserForm = (
  pathParameter: PathParameter
): FormMethod<UserEditData, HCAAtlasTrackerUser> => {
  const { user } = useFetchUser(pathParameter);
  return useForm<UserEditData, HCAAtlasTrackerUser>(
    SCHEMA,
    user,
    mapSchemaValues,
    mapApiValues
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
  };
}
