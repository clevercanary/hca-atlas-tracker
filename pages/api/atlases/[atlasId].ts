import {
  AtlasEditData,
  atlasEditSchema,
} from "app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbAtlasToListAtlas } from "app/apis/catalog/hca-atlas-tracker/common/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { ValidationError } from "yup";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBAtlasOverview,
  NetworkKey,
} from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../app/common/entities";
import {
  getUserRoleFromAuthorization,
  handleByMethod,
  handler,
  query,
  role,
} from "../../../app/utils/api-handler";

/**
 * API route to get atlas by ID or update atlas by ID.
 */

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const id = req.query.atlasId as string;
  const queryResult =
    (await getUserRoleFromAuthorization(req.headers.authorization)) ===
    "CONTENT_ADMIN"
      ? await query<HCAAtlasTrackerDBAtlas>(
          "SELECT * FROM hat.atlases WHERE id=$1",
          [id]
        )
      : await query<HCAAtlasTrackerDBAtlas>(
          "SELECT * FROM hat.atlases WHERE id=$1 AND status=$2",
          [id, ATLAS_STATUS.PUBLIC]
        );
  if (queryResult.rows.length === 0) {
    res.status(404).end();
    return;
  }
  res.json(dbAtlasToListAtlas(queryResult.rows[0]));
};

const putHandler = handler(role("CONTENT_ADMIN"), async (req, res) => {
  const id = req.query.atlasId as string;
  let newInfo: AtlasEditData;
  try {
    newInfo = await atlasEditSchema.validate(req.body);
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).json({ message: e.message });
      return;
    } else {
      throw e;
    }
  }
  const newOverviewValues: HCAAtlasTrackerDBAtlasOverview = {
    focus: newInfo.focus,
    network: newInfo.network as NetworkKey,
    version: newInfo.version,
  };
  const queryResult = await query(
    "UPDATE hat.atlases SET overview=overview||$1 WHERE id=$2 RETURNING *",
    [JSON.stringify(newOverviewValues), id]
  );
  res.status(200).json(queryResult.rows[0]);
});

export default handleByMethod({
  [METHOD.GET]: getHandler,
  [METHOD.PUT]: putHandler,
});