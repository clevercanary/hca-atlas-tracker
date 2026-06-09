import { METHOD } from "../../../../app/common/entities";
import { getAtlasStatusSummary } from "../../../../app/services/atlases";
import {
  handler,
  method,
  registeredUser,
} from "../../../../app/utils/api-handler";

/**
 * API route to get an atlas's status summary.
 */
export default handler(method(METHOD.GET), registeredUser, async (req, res) => {
  const atlasId = req.query.atlasId as string;
  res.status(200).json(await getAtlasStatusSummary(atlasId));
});
