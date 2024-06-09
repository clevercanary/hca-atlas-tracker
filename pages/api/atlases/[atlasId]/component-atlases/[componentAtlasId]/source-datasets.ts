import { ROLE } from "../../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { componentAtlasAddSourceDatasetsSchema } from "../../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../../../app/common/entities";
import {
  addSourceDatasetsToComponentAtlas,
  deleteSourceDatasetsFromComponentAtlas,
} from "../../../../../../app/services/component-atlases";
import {
  handleByMethod,
  handler,
  role,
} from "../../../../../../app/utils/api-handler";

const postHandler = handler(role(ROLE.CONTENT_ADMIN), async (req, res) => {
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
});

const deleteHandler = handler(role(ROLE.CONTENT_ADMIN), async (req, res) => {
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
});

/**
 * API route for adding or deleting multiple source datasets on a component atlas.
 */
export default handleByMethod({
  [METHOD.POST]: postHandler,
  [METHOD.DELETE]: deleteHandler,
});
