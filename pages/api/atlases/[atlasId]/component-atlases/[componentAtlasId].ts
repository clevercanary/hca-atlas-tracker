import { dbComponentAtlasToApiComponentAtlas } from "app/apis/catalog/hca-atlas-tracker/common/utils";
import { ROLE_GROUP } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { ROLE } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { componentAtlasEditSchema } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../../app/common/entities";
import {
  deleteComponentAtlas,
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
      dbComponentAtlasToApiComponentAtlas(
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
    const updatedComponentAtlas = await updateComponentAtlas(
      atlasId,
      componentAtlasId,
      await componentAtlasEditSchema.validate(req.body)
    );
    res
      .status(200)
      .json(dbComponentAtlasToApiComponentAtlas(updatedComponentAtlas));
  }
);

const deleteHandler = handler(
  role([ROLE.CONTENT_ADMIN, ROLE.INTEGRATION_LEAD]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const componentAtlasId = req.query.componentAtlasId as string;
    await deleteComponentAtlas(atlasId, componentAtlasId);
    res.status(200).end();
  }
);

export default handleByMethod({
  [METHOD.GET]: getHandler,
  [METHOD.PATCH]: patchHandler,
  [METHOD.DELETE]: deleteHandler,
});
