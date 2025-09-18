import { setAtlasSourceDatasetsReprocessedStatus } from "app/services/source-datasets";
import { ROLE } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { sourceDatasetsSetReprocessedStatusSchema } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../../app/common/entities";
import {
  handler,
  integrationLeadAssociatedAtlasOnly,
  method,
  role,
} from "../../../../../app/utils/api-handler";

/**
 * API route for setting the reprocessed status of source datasets for a given atlas.
 */
export default handler(
  method(METHOD.PATCH),
  role([ROLE.CONTENT_ADMIN, ROLE.INTEGRATION_LEAD]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const inputData = await sourceDatasetsSetReprocessedStatusSchema.validate(
      req.body
    );
    await setAtlasSourceDatasetsReprocessedStatus(atlasId, inputData);
    res.status(200).end();
  }
);
