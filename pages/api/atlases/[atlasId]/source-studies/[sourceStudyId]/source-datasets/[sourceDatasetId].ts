import { ROLE } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { sourceDatasetEditSchema } from "app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbSourceDatasetToApiSourceDataset } from "../../../../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE_GROUP } from "../../../../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { METHOD } from "../../../../../../../app/common/entities";
import {
  deleteSourceDataset,
  getSourceDataset,
  updateSourceDataset,
} from "../../../../../../../app/services/source-datasets";
import {
  handleByMethod,
  handler,
  integrationLeadAssociatedAtlasOnly,
  role,
} from "../../../../../../../app/utils/api-handler";

const getHandler = handler(role(ROLE_GROUP.READ), async (req, res) => {
  const atlasId = req.query.atlasId as string;
  const sourceStudyId = req.query.sourceStudyId as string;
  const sourceDatasetId = req.query.sourceDatasetId as string;
  res.status(200).json(
    dbSourceDatasetToApiSourceDataset(
      await getSourceDataset({
        atlasId,
        sourceDatasetId,
        sourceStudyId,
      })
    )
  );
});

const patchHandler = handler(
  role([ROLE.INTEGRATION_LEAD, ROLE.CONTENT_ADMIN]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const sourceStudyId = req.query.sourceStudyId as string;
    const sourceDatasetId = req.query.sourceDatasetId as string;
    const inputData = await sourceDatasetEditSchema.validate(req.body);
    res
      .status(200)
      .json(
        dbSourceDatasetToApiSourceDataset(
          await updateSourceDataset(
            atlasId,
            sourceStudyId,
            sourceDatasetId,
            inputData
          )
        )
      );
  }
);

const deleteHandler = handler(
  role([ROLE.INTEGRATION_LEAD, ROLE.CONTENT_ADMIN]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const sourceStudyId = req.query.sourceStudyId as string;
    const sourceDatasetId = req.query.sourceDatasetId as string;
    await deleteSourceDataset(atlasId, sourceStudyId, sourceDatasetId);
    res.status(200).end();
  }
);

/**
 * API route for getting, updating, or deleting a source dataset.
 */
export default handleByMethod({
  [METHOD.GET]: getHandler,
  [METHOD.PATCH]: patchHandler,
  [METHOD.DELETE]: deleteHandler,
});
