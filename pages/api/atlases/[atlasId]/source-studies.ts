import { ROLE_GROUP } from "../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { dbSourceStudyToApiSourceStudy } from "../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../app/common/entities";
import { getAtlasSourceStudies } from "../../../../app/services/source-studies";
import { handler, method, role } from "../../../../app/utils/api-handler";

export default handler(
  method(METHOD.GET),
  role(ROLE_GROUP.READ),
  async (req, res) => {
    const id = req.query.atlasId as string;
    res.json(
      (await getAtlasSourceStudies(id)).map(dbSourceStudyToApiSourceStudy)
    );
  }
);
