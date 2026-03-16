import { dbSourceStudyToApiSourceStudy } from "../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE_GROUP } from "../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { METHOD } from "../../../../app/common/entities";
import { getAtlasIdByUrlParameter } from "../../../../app/services/atlases";
import { getAtlasSourceStudies } from "../../../../app/services/source-studies";
import {
  handler,
  method,
  publishedOrRole,
} from "../../../../app/utils/api-handler";

export default handler(
  method(METHOD.GET),
  publishedOrRole(ROLE_GROUP.READ),
  async (req, res) => {
    const idParam = req.query.atlasId as string;
    const id = await getAtlasIdByUrlParameter(idParam);
    res.json(
      (await getAtlasSourceStudies(id)).map(dbSourceStudyToApiSourceStudy),
    );
  },
);
