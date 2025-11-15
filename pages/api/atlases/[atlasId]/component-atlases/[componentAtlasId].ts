import { ROLE } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { dbComponentAtlasFileToDetailApiComponentAtlas } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE_GROUP } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { componentAtlasEditSchema } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../../app/common/entities";
import {
  getComponentAtlas,
  updateComponentAtlas,
} from "../../../../../app/services/component-atlases";
import {
  handleByMethod,
  handler,
  integrationLeadAssociatedAtlasOnly,
  role,
} from "../../../../../app/utils/api-handler";

const getHandler = handler(role(ROLE_GROUP.READ), async (req, res) => {
  const atlasId = req.query.atlasId as string;
  const componentAtlasId = req.query.componentAtlasId as string;
  res
    .status(200)
    .json(
      dbComponentAtlasFileToDetailApiComponentAtlas(
        await getComponentAtlas(atlasId, componentAtlasId)
      )
    );
});

const patchHandler = handler(
  role([ROLE.CONTENT_ADMIN, ROLE.INTEGRATION_LEAD]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const componentAtlasId = req.query.componentAtlasId as string;
    const inputData = await componentAtlasEditSchema.validate(req.body);
    res
      .status(200)
      .json(
        dbComponentAtlasFileToDetailApiComponentAtlas(
          await updateComponentAtlas(atlasId, componentAtlasId, inputData)
        )
      );
  }
);

export default handleByMethod({
  [METHOD.GET]: getHandler,
  [METHOD.PATCH]: patchHandler,
});
