import { dbAtlasToApiAtlas } from "../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE } from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../app/common/entities";
import { createAtlasRevisionIfValid } from "../../../../app/services/atlases";
import { handler, method, role } from "../../../../app/utils/api-handler";

/**
 * API route for creating an atlas version.
 */
export default handler(
  method(METHOD.POST),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    const id = req.query.atlasId as string;
    res
      .status(201)
      .json(dbAtlasToApiAtlas(await createAtlasRevisionIfValid(id)));
  },
);
