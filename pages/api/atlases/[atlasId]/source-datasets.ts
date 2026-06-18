import { dbSourceDatasetToListApiSourceDataset } from "../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE_GROUP } from "../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { METHOD } from "../../../../app/common/entities";
import { getAtlasDatasets } from "../../../../app/services/source-datasets";
import {
  getOptionalParam,
  handler,
  method,
  publishedOrRole,
  resolveAtlasId,
} from "../../../../app/utils/api-handler";

export default handler(
  method(METHOD.GET),
  resolveAtlasId,
  publishedOrRole(ROLE_GROUP.READ),
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const archived = getOptionalParam(req, "archived", /^(?:true|false)$/);
    const isArchivedValue = archived === "true";
    res
      .status(200)
      .json(
        (await getAtlasDatasets(atlasId, isArchivedValue)).map(
          dbSourceDatasetToListApiSourceDataset,
        ),
      );
  },
);
