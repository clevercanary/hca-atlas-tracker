import { getAtlases } from "app/utils/get-entities";
import { handler, method } from "../../../app/utils/api-handler";

export default handler(method("GET"), async (req, res) => {
  const atlases = await getAtlases(req.headers.authorization);
  const atlas = atlases.find((atlas) => atlas.atlasKey === req.query.id);
  if (atlas) res.json(atlas);
  else res.status(404).end();
});
