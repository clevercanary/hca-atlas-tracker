import { getAtlasHeatmap } from "app/services/heatmaps";
import { METHOD } from "../../../../app/common/entities";
import {
  handler,
  method,
  registeredUser,
} from "../../../../app/utils/api-handler";

/**
 * API route to get heatmap data for an atlas.
 */
export default handler(method(METHOD.GET), registeredUser, async (req, res) => {
  const atlasId = req.query.atlasId as string;
  res.status(200).json(await getAtlasHeatmap(atlasId));
});
