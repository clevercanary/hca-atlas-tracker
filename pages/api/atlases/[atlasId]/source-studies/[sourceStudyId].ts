import { NextApiRequest, NextApiResponse } from "next";
import { ROLE_GROUP } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { ROLE } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { sourceStudyEditSchema } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbSourceStudyToApiSourceStudy } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../../app/common/entities";
import {
  deleteAtlasSourceStudy,
  getSourceStudy,
  updateSourceStudy,
} from "../../../../../app/services/source-studies";
import {
  handleByMethod,
  handler,
  integrationLeadAssociatedAtlasOnly,
  role,
} from "../../../../../app/utils/api-handler";

const getHandler = handler(
  role(ROLE_GROUP.READ),
  async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const atlasId = req.query.atlasId as string;
    const sourceStudyId = req.query.sourceStudyId as string;

    res.json(
      dbSourceStudyToApiSourceStudy(
        await getSourceStudy(atlasId, sourceStudyId)
      )
    );
  }
);

const putHandler = handler(
  role([ROLE.INTEGRATION_LEAD, ROLE.CONTENT_ADMIN]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const sourceStudyId = req.query.sourceStudyId as string;
    const newStudy = await updateSourceStudy(
      atlasId,
      sourceStudyId,
      await sourceStudyEditSchema.validate(req.body)
    );
    res.json(dbSourceStudyToApiSourceStudy(newStudy));
  }
);

const deleteHandler = handler(
  role([ROLE.INTEGRATION_LEAD, ROLE.CONTENT_ADMIN]),
  integrationLeadAssociatedAtlasOnly,
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
