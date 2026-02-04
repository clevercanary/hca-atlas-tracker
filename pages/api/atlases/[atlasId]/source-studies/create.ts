import { createSourceStudy } from "app/services/source-studies";
import { dbSourceStudyToApiSourceStudy } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { newSourceStudySchema } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../../app/common/entities";
import {
  handler,
  integrationLeadAssociatedAtlasOnly,
  method,
  role,
} from "../../../../../app/utils/api-handler";

/**
 * API route for creating a source study. Source study information is provided as a JSON body.
 */
export default handler(
  method(METHOD.POST),
  role([ROLE.INTEGRATION_LEAD, ROLE.CONTENT_ADMIN]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const newStudy = await createSourceStudy(
      atlasId,
      await newSourceStudySchema.validate(req.body),
    );
    res.status(201).json(dbSourceStudyToApiSourceStudy(newStudy));
  },
);
