import { HCAAtlasTrackerActiveUser } from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../app/common/entities";
import {
  getUserFromAuthorization,
  handler,
  method,
} from "../../app/utils/api-handler";

export default handler(method(METHOD.GET), async (req, res) => {
  const user = await getUserFromAuthorization(req.headers.authorization);
  if (!user) {
    res.status(401).json({ message: "User not found" });
    return;
  }
  const activeUserInfo: HCAAtlasTrackerActiveUser = {
    email: user.email,
    fullName: user.full_name,
    role: user.role,
  };
  res.json(activeUserInfo);
});
