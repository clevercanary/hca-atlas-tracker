import {
  HCAAtlasTrackerActiveUser,
  ROLE,
} from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../app/common/entities";
import { getProvidedUserProfile } from "../../app/services/user-profile";
import { createUser, updateLastLogin } from "../../app/services/users";
import {
  getUserFromAuthorization,
  handler,
  method,
  UnauthenticatedError,
} from "../../app/utils/api-handler";

export default handler(method(METHOD.PUT), async (req, res) => {
  const userProfile = await getProvidedUserProfile(req.headers.authorization);
  if (!userProfile) throw new UnauthenticatedError("Not authenticated");
  let user = await getUserFromAuthorization(req.headers.authorization);
  if (!user) {
    user = await createUser({
      disabled: false,
      email: userProfile.email,
      fullName: userProfile.name,
      role: ROLE.STAKEHOLDER,
      roleAssociatedResourceIds: [],
    });
  }
  await updateLastLogin(user.id);
  const activeUserInfo: HCAAtlasTrackerActiveUser = {
    disabled: user.disabled,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    roleAssociatedResourceIds: user.role_associated_resource_ids,
  };
  res.json(activeUserInfo);
});
