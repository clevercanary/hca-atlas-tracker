import { dbAtlasToApiAtlas } from "app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { atlasEditSchema } from "app/apis/catalog/hca-atlas-tracker/common/schema";
import { NextApiRequest, NextApiResponse } from "next";
import { ROLE_GROUP } from "../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { ROLE } from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../app/common/entities";
import { getAtlas, updateAtlas } from "../../../app/services/atlases";
import { handleByMethod, handler, role } from "../../../app/utils/api-handler";

/**
 * API route to get atlas by ID or update atlas by ID.
 */

const getHandler = handler(
  role(ROLE_GROUP.READ),
  async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const id = req.query.atlasId as string;
    res.json(dbAtlasToApiAtlas(await getAtlas(id)));
  }
);

const putHandler = handler(role(ROLE.CONTENT_ADMIN), async (req, res) => {
  const id = req.query.atlasId as string;
  const data = await atlasEditSchema.validate(req.body);
  res.status(200).json(dbAtlasToApiAtlas(await updateAtlas(id, data)));
});

export default handleByMethod({
  [METHOD.GET]: getHandler,
  [METHOD.PUT]: putHandler,
});
