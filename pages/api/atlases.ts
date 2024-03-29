import { getAtlases } from "app/utils/get-entities";
import { handler, method } from "../../app/utils/api-handler";

/**
 * API route for atlas list.
 */
export default handler(method("GET"), async (req, res) => {
  res.json(
    Object.fromEntries(
      Object.entries(await getAtlases(req.headers.authorization))
    )
  );
});
