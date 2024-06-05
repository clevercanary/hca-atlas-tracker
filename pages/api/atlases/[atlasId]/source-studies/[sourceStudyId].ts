import { NextApiRequest, NextApiResponse } from "next";
import { ROLE_GROUP } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  HCAAtlasTrackerDBSourceStudy,
  ROLE,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { sourceStudyEditSchema } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbSourceStudyToApiSourceStudy } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../../app/common/entities";
import { query } from "../../../../../app/services/database";
import {
  confirmSourceStudyExistsOnAtlas,
  deleteAtlasSourceStudy,
  updateSourceStudy,
} from "../../../../../app/services/source-datasets";
import {
  AccessError,
  handleByMethod,
  handler,
  NotFoundError,
  role,
} from "../../../../../app/utils/api-handler";

const getHandler = handler(
  role(ROLE_GROUP.READ),
  async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const atlasId = req.query.atlasId as string;
    const sourceStudyId = req.query.sourceStudyId as string;

    try {
      await confirmSourceStudyExistsOnAtlas(sourceStudyId, atlasId);
    } catch (e) {
      if (e instanceof AccessError) {
        res.status(403).json({ message: e.message });
        return;
      }
      throw e;
    }

    const queryResult = await query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies WHERE id=$1",
      [sourceStudyId]
    );

    if (queryResult.rows.length === 0)
      throw new NotFoundError(
        `Source study with ID ${sourceStudyId} doesn't exist`
      );

    res.json(dbSourceStudyToApiSourceStudy(queryResult.rows[0]));
  }
);

const putHandler = handler(
  role(ROLE.CONTENT_ADMIN), // Since the route is restricted to content admins, there are no additional permissions checks
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const sourceStudyId = req.query.sourceStudyId as string;
    const newDataset = await updateSourceStudy(
      atlasId,
      sourceStudyId,
      await sourceStudyEditSchema.validate(req.body)
    );
    res.json(dbSourceStudyToApiSourceStudy(newDataset));
  }
);

const deleteHandler = handler(
  role(ROLE.CONTENT_ADMIN), // Since the route is restricted to content admins, there are no additional permissions checks
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const sourceStudyId = req.query.sourceStudyId as string;
    await deleteAtlasSourceStudy(atlasId, sourceStudyId);
    res.status(200).end();
  }
);

export default handleByMethod({
  [METHOD.DELETE]: deleteHandler,
  [METHOD.GET]: getHandler,
  [METHOD.PUT]: putHandler,
});
