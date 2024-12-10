import {
  addSourceDatasetToAtlas,
  removeSourceDatasetFromAtlas,
} from "app/services/atlases";
import { ROLE } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../../app/common/entities";
import {
  handleByMethod,
  handler,
  integrationLeadAssociatedAtlasOnly,
  role,
} from "../../../../../app/utils/api-handler";

const postHandler = handler(
  role([ROLE.CONTENT_ADMIN, ROLE.INTEGRATION_LEAD]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const sourceDatasetId = req.query.sourceDatasetId as string;
    await addSourceDatasetToAtlas(atlasId, sourceDatasetId);
    res.status(201).end();
  }
);

const deleteHandler = handler(
  role([ROLE.CONTENT_ADMIN, ROLE.INTEGRATION_LEAD]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const sourceDatasetId = req.query.sourceDatasetId as string;
    await removeSourceDatasetFromAtlas(atlasId, sourceDatasetId);
    res.status(200).end();
  }
);

/**
 * API route for adding or deleting a source dataset on an atlas.
 */
export default handleByMethod({
  [METHOD.POST]: postHandler,
  [METHOD.DELETE]: deleteHandler,
});