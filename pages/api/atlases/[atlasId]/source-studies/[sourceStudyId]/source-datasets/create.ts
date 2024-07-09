import { ROLE } from "../../../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { newSourceDatasetSchema } from "../../../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbSourceDatasetToApiSourceDataset } from "../../../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../../../../app/common/entities";
import { createSourceDataset } from "../../../../../../../app/services/source-datasets";
import {
  handler,
  integrationLeadAssociatedAtlasOnly,
  method,
  role,
} from "../../../../../../../app/utils/api-handler";

/**
 * API route for creating a source dataset.
 */
export default handler(
  method(METHOD.POST),
  role([ROLE.INTEGRATION_LEAD, ROLE.CONTENT_ADMIN]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const sourceStudyId = req.query.sourceStudyId as string;
    const inputData = await newSourceDatasetSchema.validate(req.body);
    res
      .status(201)
      .json(
        dbSourceDatasetToApiSourceDataset(
          await createSourceDataset(atlasId, sourceStudyId, inputData)
        )
      );
  }
);
