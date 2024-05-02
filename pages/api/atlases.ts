import { ROLE_GROUP } from "app/apis/catalog/hca-atlas-tracker/common/constants";
import { HCAAtlasTrackerDBAtlas } from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { dbAtlasToApiAtlas } from "../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../app/common/entities";
import { query } from "../../app/services/database";
import { handler, method, role } from "../../app/utils/api-handler";

/**
 * API route for atlas list.
 */
export default handler(
  method(METHOD.GET),
  role(ROLE_GROUP.READ),
  async (req, res) => {
    const queryResult = await query<HCAAtlasTrackerDBAtlas>(
      "SELECT * FROM hat.atlases"
    );
    res.json(queryResult.rows.map(dbAtlasToApiAtlas));
  }
);
