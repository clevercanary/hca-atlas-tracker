import { dbSourceDatasetToApiSourceDataset } from "app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE_GROUP } from "../../../../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { METHOD } from "../../../../../../../app/common/entities";
import { getComponentAtlasSourceDataset } from "../../../../../../../app/services/source-datasets";
import {
  handler,
  method,
  role,
} from "../../../../../../../app/utils/api-handler";

/**
 * API route for getting a source dataset of a component atlas.
 */
export default handler(
  method(METHOD.GET),
  role(ROLE_GROUP.READ),
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const componentAtlasId = req.query.componentAtlasId as string;
    const sourceDatasetId = req.query.sourceDatasetId as string;
    res
      .status(200)
      .json(
        dbSourceDatasetToApiSourceDataset(
          await getComponentAtlasSourceDataset(
            atlasId,
            componentAtlasId,
            sourceDatasetId,
          ),
        ),
      );
  },
);
