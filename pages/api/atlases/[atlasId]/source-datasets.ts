import { dbSourceDatasetToApiSourceDataset } from "../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE_GROUP } from "../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { METHOD } from "../../../../app/common/entities";
import { getAtlasDatasets } from "../../../../app/services/source-datasets";
import { handler, method, role } from "../../../../app/utils/api-handler";

/**
 * Get all source datasets linked to the given atlas.
 * @param req - Next API request.
 * @param res - Next API response.
 */
export default handler(
  method(METHOD.GET),
  role(ROLE_GROUP.READ),
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    res
      .status(200)
      .json(
        (await getAtlasDatasets(atlasId)).map(dbSourceDatasetToApiSourceDataset)
      );
  }
);
