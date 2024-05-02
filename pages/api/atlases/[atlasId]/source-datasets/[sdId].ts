import { NextApiRequest, NextApiResponse } from "next";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerDBSourceDataset,
  ROLE,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { sourceDatasetEditSchema } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbSourceDatasetToApiSourceDataset } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../../app/common/entities";
import { query } from "../../../../../app/services/database";
import {
  confirmSourceDatasetExistsOnAtlas,
  updateSourceDataset,
} from "../../../../../app/services/source-datasets";
import {
  AccessError,
  getUserRoleFromAuthorization,
  handleByMethod,
  handler,
  NotFoundError,
  role,
} from "../../../../../app/utils/api-handler";

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const atlasId = req.query.atlasId as string;
  const sdId = req.query.sdId as string;

  const role = await getUserRoleFromAuthorization(req.headers.authorization);

  try {
    await confirmSourceDatasetExistsOnAtlas(
      sdId,
      atlasId,
      role === ROLE.CONTENT_ADMIN ? undefined : [ATLAS_STATUS.PUBLIC]
    );
  } catch (e) {
    if (e instanceof AccessError) {
      res.status(role === null ? 401 : 403).json({ message: e.message });
      return;
    }
    throw e;
  }

  const queryResult = await query<HCAAtlasTrackerDBSourceDataset>(
    "SELECT * FROM hat.source_datasets WHERE id=$1",
    [sdId]
  );

  if (queryResult.rows.length === 0)
    throw new NotFoundError(`Source dataset with ID ${sdId} doesn't exist`);

  res.json(dbSourceDatasetToApiSourceDataset(queryResult.rows[0]));
}

const putHandler = handler(
  role(ROLE.CONTENT_ADMIN), // Since the route is restricted to content admins, there are no additional permissions checks
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const sdId = req.query.sdId as string;
    const newDataset = await updateSourceDataset(
      atlasId,
      sdId,
      await sourceDatasetEditSchema.validate(req.body)
    );
    res.json(dbSourceDatasetToApiSourceDataset(newDataset));
  }
);

export default handleByMethod({
  [METHOD.GET]: getHandler,
  [METHOD.PUT]: putHandler,
});
