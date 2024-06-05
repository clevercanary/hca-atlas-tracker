import { ROLE_GROUP } from "app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceStudy,
} from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { dbSourceStudyToApiSourceStudy } from "../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../app/common/entities";
import { query } from "../../../../app/services/database";
import { handler, method, role } from "../../../../app/utils/api-handler";

export default handler(
  method(METHOD.GET),
  role(ROLE_GROUP.READ),
  async (req, res) => {
    const id = req.query.atlasId as string;
    const {
      rows: [atlas],
    } = await query<Pick<HCAAtlasTrackerDBAtlas, "source_studies" | "status">>(
      "SELECT source_studies, status FROM hat.atlases WHERE id=$1",
      [id]
    );
    if (!atlas) {
      res.status(404).end();
      return;
    }
    const sourceStudies =
      atlas.source_studies.length === 0
        ? []
        : (
            await query<HCAAtlasTrackerDBSourceStudy>(
              "SELECT * FROM hat.source_studies WHERE id=ANY($1)",
              [atlas.source_studies]
            )
          ).rows;
    res.json(sourceStudies.map(dbSourceStudyToApiSourceStudy));
  }
);
