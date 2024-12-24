import { dbAtlasToApiAtlas } from "../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE } from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { newAtlasSchema } from "../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../app/common/entities";
import { createAtlas } from "../../../app/services/atlases";
import { handler, method, role } from "../../../app/utils/api-handler";

/**
 * API route for creating an atlas. Atlas information is provided as a JSON body.
 */
export default handler(
  method(METHOD.POST),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    const data = await newAtlasSchema.validate(req.body);
    res.status(201).json(dbAtlasToApiAtlas(await createAtlas(data)));
  }
);
