import { ROLE_GROUP } from "app/apis/catalog/hca-atlas-tracker/common/constants";
import { ROLE } from "../../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { componentAtlasAddSourceDatasetsSchema } from "../../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbSourceDatasetToApiSourceDataset } from "../../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../../../app/common/entities";
import {
  addSourceDatasetsToComponentAtlas,
  deleteSourceDatasetsFromComponentAtlas,
} from "../../../../../../app/services/component-atlases";
import { getComponentAtlasDatasets } from "../../../../../../app/services/source-datasets";
import {
  handleByMethod,
  handler,
  integrationLeadAssociatedAtlasOnly,
  role,
} from "../../../../../../app/utils/api-handler";

const getHandler = handler(role(ROLE_GROUP.READ), async (req, res) => {
  const atlasId = req.query.atlasId as string;
  const componentAtlasId = req.query.componentAtlasId as string;
  res
    .status(200)
    .json(
      (await getComponentAtlasDatasets(atlasId, componentAtlasId)).map(
        dbSourceDatasetToApiSourceDataset
      )
    );
});

const postHandler = handler(
  role([ROLE.CONTENT_ADMIN, ROLE.INTEGRATION_LEAD]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const componentAtlasId = req.query.componentAtlasId as string;
    const { sourceDatasetIds } =
      await componentAtlasAddSourceDatasetsSchema.validate(req.body);
    await addSourceDatasetsToComponentAtlas(
      atlasId,
      componentAtlasId,
      sourceDatasetIds
    );
    res.status(201).end();
  }
);

const deleteHandler = handler(
  role([ROLE.CONTENT_ADMIN, ROLE.INTEGRATION_LEAD]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const componentAtlasId = req.query.componentAtlasId as string;
    const { sourceDatasetIds } =
      await componentAtlasAddSourceDatasetsSchema.validate(req.body);
    await deleteSourceDatasetsFromComponentAtlas(
      atlasId,
      componentAtlasId,
      sourceDatasetIds
    );
    res.status(200).end();
  }
);

/**
 * API route for adding or deleting multiple source datasets on a component atlas.
 */
export default handleByMethod({
  [METHOD.GET]: getHandler,
  [METHOD.POST]: postHandler,
  [METHOD.DELETE]: deleteHandler,
});
