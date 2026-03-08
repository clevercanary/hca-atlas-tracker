import { dbAtlasToApiAtlas } from "app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE } from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../app/common/entities";
import { publishAtlas } from "../../../../app/services/atlases";
import { handler, method, role } from "../../../../app/utils/api-handler";

/**
 * API route to publish an atlas.
 */

export default handler(
  method(METHOD.POST),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    const id = req.query.atlasId as string;
    const updatedAtlas = await publishAtlas(id);
    res.status(200).json(dbAtlasToApiAtlas(updatedAtlas));
  },
);
