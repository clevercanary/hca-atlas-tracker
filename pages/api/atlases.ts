import { ATLAS_STATUS } from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { dbAtlasToListAtlas } from "../../app/apis/catalog/hca-atlas-tracker/common/utils";
import {
  getUserRoleFromAuthorization,
  handler,
  method,
  query,
} from "../../app/utils/api-handler";

/**
 * API route for atlas list.
 */
export default handler(method("GET"), async (req, res) => {
  const queryResult =
    (await getUserRoleFromAuthorization(req.headers.authorization)) ===
    "CONTENT_ADMIN"
      ? await query("SELECT * FROM hat.atlases")
      : await query("SELECT * FROM hat.atlases WHERE status=$1", [
          ATLAS_STATUS.PUBLIC,
        ]);
  const atlases = queryResult.rows.map(dbAtlasToListAtlas);
  res.json(Object.fromEntries(Object.entries(atlases)));
});
