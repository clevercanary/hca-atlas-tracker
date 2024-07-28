import { ROLE } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { newComponentAtlasSchema } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbComponentAtlasToApiComponentAtlas } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../../app/common/entities";
import { createComponentAtlas } from "../../../../../app/services/component-atlases";
import {
  handler,
  integrationLeadAssociatedAtlasOnly,
  method,
  role,
} from "../../../../../app/utils/api-handler";

/**
 * API route for creating a component atlas.
 */
export default handler(
  method(METHOD.POST),
  role([ROLE.CONTENT_ADMIN, ROLE.INTEGRATION_LEAD]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const newComponentAtlas = await createComponentAtlas(
      atlasId,
      await newComponentAtlasSchema.validate(req.body)
    );
    res
      .status(201)
      .json(dbComponentAtlasToApiComponentAtlas(newComponentAtlas));
  }
);
