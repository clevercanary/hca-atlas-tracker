import { dbComponentAtlasFileToApiComponentAtlas } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE_GROUP } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { METHOD } from "../../../../../app/common/entities";
import { getComponentAtlas } from "../../../../../app/services/component-atlases";
import { handler, method, role } from "../../../../../app/utils/api-handler";

export default handler(
  method(METHOD.GET),
  role(ROLE_GROUP.READ),
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const componentAtlasId = req.query.componentAtlasId as string;
    res
      .status(200)
      .json(
        dbComponentAtlasFileToApiComponentAtlas(
          await getComponentAtlas(atlasId, componentAtlasId)
        )
      );
  }
);
