import {
  AtlasEditData,
  atlasEditSchema,
} from "app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbAtlasToApiAtlas } from "app/apis/catalog/hca-atlas-tracker/common/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { ValidationError } from "yup";
import { ROLE_GROUP } from "../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBAtlasOverview,
  ROLE,
} from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../app/common/entities";
import { query } from "../../../app/services/database";
import {
  handleByMethod,
  handler,
  respondValidationError,
  role,
} from "../../../app/utils/api-handler";

/**
 * API route to get atlas by ID or update atlas by ID.
 */

const getHandler = handler(
  role(ROLE_GROUP.READ),
  async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const id = req.query.atlasId as string;
    const queryResult = await query<HCAAtlasTrackerDBAtlas>(
      "SELECT * FROM hat.atlases WHERE id=$1",
      [id]
    );
    if (queryResult.rows.length === 0) {
      res.status(404).end();
      return;
    }
    res.json(dbAtlasToApiAtlas(queryResult.rows[0]));
  }
);

const putHandler = handler(role(ROLE.CONTENT_ADMIN), async (req, res) => {
  const id = req.query.atlasId as string;
  let newInfo: AtlasEditData;
  try {
    newInfo = await atlasEditSchema.validate(req.body);
  } catch (e) {
    if (e instanceof ValidationError) {
      respondValidationError(res, e);
      return;
    } else {
      throw e;
    }
  }
  const newOverviewValues: Omit<
    HCAAtlasTrackerDBAtlasOverview,
    "completedTaskCount" | "taskCount"
  > = {
    integrationLead: newInfo.integrationLead,
    network: newInfo.network,
    shortName: newInfo.shortName,
    version: newInfo.version,
    wave: newInfo.wave,
  };
  const queryResult = await query<HCAAtlasTrackerDBAtlas>(
    "UPDATE hat.atlases SET overview=overview||$1 WHERE id=$2 RETURNING *",
    [JSON.stringify(newOverviewValues), id]
  );
  res.status(200).json(dbAtlasToApiAtlas(queryResult.rows[0]));
});

export default handleByMethod({
  [METHOD.GET]: getHandler,
  [METHOD.PUT]: putHandler,
});
