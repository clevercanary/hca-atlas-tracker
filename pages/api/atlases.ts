import { ROLE_GROUP } from "app/apis/catalog/hca-atlas-tracker/common/constants";
import { getAllAtlases } from "app/services/atlases";
import { dbAtlasToApiAtlas } from "../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { METHOD } from "../../app/common/entities";
import { handler, method, role } from "../../app/utils/api-handler";

/**
 * API route for atlas list.
 */
export default handler(
  method(METHOD.GET),
  role(ROLE_GROUP.READ),
  async (req, res) => {
    res.json((await getAllAtlases()).map(dbAtlasToApiAtlas));
  },
);
