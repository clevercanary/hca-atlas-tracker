import { dbSourceDatasetToListApiSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE_GROUP } from "@/app/apis/catalog/hca-atlas-tracker/common/constants";
import { ROLE } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  componentAtlasAddSourceDatasetsSchema,
  componentAtlasSetSourceDatasetsSchema,
} from "@/app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "@/app/common/entities";
import {
  addSourceDatasetsToComponentAtlas,
  deleteSourceDatasetsFromComponentAtlas,
  setComponentAtlasSourceDatasets,
} from "@/app/services/component-atlases";
import { getComponentAtlasDatasets } from "@/app/services/source-datasets";
import {
  bearerAllowed,
  handleByMethod,
  handler,
  integrationLeadAssociatedAtlasOnly,
  role,
} from "@/app/utils/api-handler";

const getHandler = handler(role(ROLE_GROUP.READ), async (req, res) => {
  const atlasId = req.query.atlasId as string;
  const componentAtlasId = req.query.componentAtlasId as string;
  res
    .status(200)
    .json(
      (await getComponentAtlasDatasets(atlasId, componentAtlasId)).map(
        dbSourceDatasetToListApiSourceDataset,
      ),
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
      sourceDatasetIds,
    );
    res.status(201).end();
  },
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
      sourceDatasetIds,
    );
    res.status(200).end();
  },
);

// Allowed for API tokens, so that scripts and agents can sync a component atlas's source datasets; POST and DELETE aren't, since this covers both.
const putHandler = handler(
  bearerAllowed,
  role([ROLE.CONTENT_ADMIN, ROLE.INTEGRATION_LEAD]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const componentAtlasId = req.query.componentAtlasId as string;
    const { sourceDatasetIds } =
      await componentAtlasSetSourceDatasetsSchema.validate(req.body);
    res
      .status(200)
      .json(
        await setComponentAtlasSourceDatasets(
          atlasId,
          componentAtlasId,
          sourceDatasetIds,
        ),
      );
  },
);

/**
 * API route for adding, deleting, or replacing multiple source datasets on a component atlas.
 */
export default handleByMethod({
  [METHOD.GET]: getHandler,
  [METHOD.POST]: postHandler,
  [METHOD.PUT]: putHandler,
  [METHOD.DELETE]: deleteHandler,
});
