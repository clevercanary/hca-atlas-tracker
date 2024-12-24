import { dbComponentAtlasToApiComponentAtlas } from "../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE_GROUP } from "../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { METHOD } from "../../../../app/common/entities";
import { getAtlasComponentAtlases } from "../../../../app/services/component-atlases";
import { handler, method, role } from "../../../../app/utils/api-handler";

/**
 * API route for getting an atlas's component atlases.
 */
export default handler(
  method(METHOD.GET),
  role(ROLE_GROUP.READ),
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    res
      .status(200)
      .json(
        (await getAtlasComponentAtlases(atlasId)).map(
          dbComponentAtlasToApiComponentAtlas
        )
      );
  }
);
