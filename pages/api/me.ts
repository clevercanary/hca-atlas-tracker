import {
  HCAAtlasTrackerActiveUser,
  ROLE,
} from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../app/common/entities";
import { getProvidedUserProfile } from "../../app/services/user-profile";
import { updateLastLogin } from "../../app/services/users";
import {
  getUserFromAuthorization,
  handler,
  method,
} from "../../app/utils/api-handler";

export default handler(method(METHOD.GET), async (req, res) => {
  const userProfile = await getProvidedUserProfile(req.headers.authorization);
  const user = await getUserFromAuthorization(req.headers.authorization);
  let activeUserInfo: HCAAtlasTrackerActiveUser;
  if (user) {
    await updateLastLogin(user.id);
    activeUserInfo = {
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };
  } else if (userProfile) {
    activeUserInfo = {
      email: userProfile.email,
      fullName: userProfile.name,
      role: ROLE.UNREGISTERED,
    };
  } else {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  res.json(activeUserInfo);
});
