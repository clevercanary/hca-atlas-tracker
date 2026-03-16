import { dbSourceDatasetToApiSourceDataset } from "../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE_GROUP } from "../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { METHOD } from "../../../../app/common/entities";
import { getAtlasIdByUrlParameter } from "../../../../app/services/atlases";
import { getAtlasDatasets } from "../../../../app/services/source-datasets";
import {
  handleOptionalParam,
  handler,
  method,
  publishedOrRole,
} from "../../../../app/utils/api-handler";

export default handler(
  method(METHOD.GET),
  publishedOrRole(ROLE_GROUP.READ),
  async (req, res) => {
    const atlasIdParam = req.query.atlasId as string;
    const atlasId = await getAtlasIdByUrlParameter(atlasIdParam);
    const { param: archived, responseSent } = handleOptionalParam(
      req,
      res,
      "archived",
      /^(?:true|false)$/,
    );
    if (responseSent) return;
    const isArchivedValue = archived === "true";
    res
      .status(200)
      .json(
        (await getAtlasDatasets(atlasId, isArchivedValue)).map(
          dbSourceDatasetToApiSourceDataset,
        ),
      );
  },
);
