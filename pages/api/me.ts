import {
  HCAAtlasTrackerActiveUser,
  ROLE,
} from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../app/common/entities";
import { updateLastLogin } from "../../app/services/users";
import {
  getActiveUser,
  getProvidedUserProfile,
  handler,
  method,
} from "../../app/utils/api-handler";

export default handler(method(METHOD.GET), async (req, res) => {
  const userProfile = await getProvidedUserProfile(req, res);
  const user = await getActiveUser(req, res);
  let activeUserInfo: HCAAtlasTrackerActiveUser;
  if (user) {
    await updateLastLogin(user.id);
    activeUserInfo = {
      disabled: user.disabled,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      roleAssociatedResourceIds: user.role_associated_resource_ids,
    };
  } else if (userProfile) {
    activeUserInfo = {
      disabled: false,
      email: userProfile.email,
      fullName: userProfile.name,
      role: ROLE.UNREGISTERED,
      roleAssociatedResourceIds: [],
    };
  } else {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  res.json(activeUserInfo);
});
