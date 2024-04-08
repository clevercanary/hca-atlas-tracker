import { dbAtlasToListAtlas } from "app/apis/catalog/hca-atlas-tracker/common/utils";
import { ATLAS_STATUS } from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../app/common/entities";
import {
  getUserRoleFromAuthorization,
  handler,
  method,
  query,
} from "../../../app/utils/api-handler";

/**
 * API route for atlas by ID.
 */
export default handler(method(METHOD.GET), async (req, res) => {
  const id = req.query.atlasId as string;
  const queryResult =
    (await getUserRoleFromAuthorization(req.headers.authorization)) ===
    "CONTENT_ADMIN"
      ? await query("SELECT * FROM hat.atlases WHERE id=$1", [id])
      : await query("SELECT * FROM hat.atlases WHERE id=$1 AND status=$2", [
          id,
          ATLAS_STATUS.PUBLIC,
        ]);
  if (queryResult.rows.length === 0) {
    res.status(404).end();
    return;
  }
  res.json(dbAtlasToListAtlas(queryResult.rows[0]));
});
