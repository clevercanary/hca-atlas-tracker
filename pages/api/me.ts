import {
  HCAAtlasTrackerActiveUser,
  ROLE,
} from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../app/common/entities";
import {
  getAccessTokenInfo,
  getUserFromAuthorization,
  handler,
  method,
} from "../../app/utils/api-handler";

export default handler(method(METHOD.GET), async (req, res) => {
  const tokenInfo = await getAccessTokenInfo(req.headers.authorization);
  const user = await getUserFromAuthorization(req.headers.authorization);
  let activeUserInfo: HCAAtlasTrackerActiveUser;
  if (user) {
    activeUserInfo = {
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };
  } else if (tokenInfo) {
    activeUserInfo = {
      email: tokenInfo.email ?? "",
      fullName: tokenInfo.email ?? "",
      role: ROLE.UNREGISTERED,
    };
  } else {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  res.json(activeUserInfo);
});
