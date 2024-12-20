import {
  addSourceDatasetToAtlas,
  removeSourceDatasetFromAtlas,
} from "app/services/atlases";
import { ROLE_GROUP } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { ROLE } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { atlasSourceDatasetEditSchema } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbSourceDatasetToApiSourceDataset } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../../app/common/entities";
import {
  getAtlasSourceDataset,
  updateAtlasSourceDataset,
} from "../../../../../app/services/source-datasets";
import {
  handleByMethod,
  handler,
  integrationLeadAssociatedAtlasOnly,
  role,
} from "../../../../../app/utils/api-handler";

const getHandler = handler(role(ROLE_GROUP.READ), async (req, res) => {
  const atlasId = req.query.atlasId as string;
  const sourceDatasetId = req.query.sourceDatasetId as string;
  res.json(
    dbSourceDatasetToApiSourceDataset(
      await getAtlasSourceDataset(atlasId, sourceDatasetId)
    )
  );
});

const patchHandler = handler(
  role([ROLE.CONTENT_ADMIN, ROLE.INTEGRATION_LEAD]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const sourceDatasetId = req.query.sourceDatasetId as string;
    const inputData = await atlasSourceDatasetEditSchema.validate(req.body);
    res.json(
      dbSourceDatasetToApiSourceDataset(
        await updateAtlasSourceDataset(atlasId, sourceDatasetId, inputData)
      )
    );
  }
);

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
  [METHOD.GET]: getHandler,
  [METHOD.PATCH]: patchHandler,
  [METHOD.POST]: postHandler,
  [METHOD.DELETE]: deleteHandler,
});
