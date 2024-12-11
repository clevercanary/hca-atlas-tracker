import { ROLE_GROUP } from "../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { dbSourceDatasetToApiSourceDataset } from "../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../app/common/entities";
import { getAtlasDatasets } from "../../../../app/services/source-datasets";
import { handler, method, role } from "../../../../app/utils/api-handler";

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
