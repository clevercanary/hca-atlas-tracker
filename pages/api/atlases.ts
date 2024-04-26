import {
  ATLAS_STATUS,
  HCAAtlasTrackerDBAtlas,
} from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { dbAtlasToApiAtlas } from "../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../app/common/entities";
import { query } from "../../app/services/database";
import {
  getUserRoleFromAuthorization,
  handler,
  method,
} from "../../app/utils/api-handler";

/**
 * API route for atlas list.
 */
export default handler(method(METHOD.GET), async (req, res) => {
  const queryResult =
    (await getUserRoleFromAuthorization(req.headers.authorization)) ===
    "CONTENT_ADMIN"
      ? await query<HCAAtlasTrackerDBAtlas>("SELECT * FROM hat.atlases")
      : await query<HCAAtlasTrackerDBAtlas>(
          "SELECT * FROM hat.atlases WHERE status=$1",
          [ATLAS_STATUS.PUBLIC]
        );
  res.json(queryResult.rows.map(dbAtlasToApiAtlas));
});
