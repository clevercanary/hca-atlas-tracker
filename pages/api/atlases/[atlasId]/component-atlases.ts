import { dbComponentAtlasFileToApiComponentAtlas } from "../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE_GROUP } from "../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { METHOD } from "../../../../app/common/entities";
import { getAtlasIdByUrlParameter } from "../../../../app/services/atlases";
import { getAtlasComponentAtlases } from "../../../../app/services/component-atlases";
import {
  handleOptionalParam,
  handler,
  method,
  role,
} from "../../../../app/utils/api-handler";

/**
 * API route for getting an atlas's component atlases.
 */
export default handler(
  method(METHOD.GET),
  role(ROLE_GROUP.READ),
  async (req, res) => {
    const atlasIdParam = req.query.atlasId as string;
    const atlasId = await getAtlasIdByUrlParameter(atlasIdParam);
    const { param: archived, responseSent } = handleOptionalParam(
      req,
      res,
      "archived",
      /^(?:true|false)$/,
    );
    if (responseSent) return;
    const isArchivedValue = archived === "true";
    res
      .status(200)
      .json(
        (await getAtlasComponentAtlases(atlasId, isArchivedValue)).map(
          dbComponentAtlasFileToApiComponentAtlas,
        ),
      );
  },
);
