import { dbSourceDatasetToApiSourceDataset } from "../../../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE_GROUP } from "../../../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { METHOD } from "../../../../../../app/common/entities";
import { getSourceStudyDatasets } from "../../../../../../app/services/source-datasets";
import { handler, method, role } from "../../../../../../app/utils/api-handler";

/**
 * API route for getting a source study's source datasets.
 */
export default handler(
  method(METHOD.GET),
  role(ROLE_GROUP.READ),
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const sourceStudyId = req.query.sourceStudyId as string;
    res
      .status(200)
      .json(
        (await getSourceStudyDatasets(atlasId, sourceStudyId)).map(
          dbSourceDatasetToApiSourceDataset
        )
      );
  }
);
