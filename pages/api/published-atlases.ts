import { dbAtlasToAtlasSummary } from "../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { METHOD } from "../../app/common/entities";
import { getAllPublishedAtlases } from "../../app/services/atlases";
import { handler, method } from "../../app/utils/api-handler";

/**
 * API route for published atlas list.
 */
export default handler(method(METHOD.GET), async (req, res) => {
  res.json((await getAllPublishedAtlases()).map(dbAtlasToAtlasSummary));
});
