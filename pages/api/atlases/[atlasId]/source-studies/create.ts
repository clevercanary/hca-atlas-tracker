import { createSourceStudy } from "app/services/source-studies";
import { ROLE } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { newSourceStudySchema } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbSourceStudyToApiSourceStudy } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../../app/common/entities";
import { handler, method, role } from "../../../../../app/utils/api-handler";

/**
 * API route for creating a source study. Source study information is provided as a JSON body.
 */
export default handler(
  method(METHOD.POST),
  role(ROLE.CONTENT_ADMIN), // Since the route is restricted to content admins, there are no additional permissions checks
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const newDataset = await createSourceStudy(
      atlasId,
      await newSourceStudySchema.validate(req.body)
    );
    res.status(201).json(dbSourceStudyToApiSourceStudy(newDataset));
  }
);
