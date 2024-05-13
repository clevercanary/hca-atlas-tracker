import { HCAAtlasTrackerDBValidationWithAtlasProperties } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { ROLE_GROUP } from "../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { dbValidationToApiValidation } from "../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../app/common/entities";
import { query } from "../../app/services/database";
import { handler, method, role } from "../../app/utils/api-handler";

export default handler(
  method(METHOD.GET),
  role(ROLE_GROUP.READ),
  async (req, res) => {
    const queryResult =
      await query<HCAAtlasTrackerDBValidationWithAtlasProperties>(`
        SELECT
          v.*,
          ARRAY_AGG(DISTINCT a.overview->>'shortName') AS atlas_short_names,
          ARRAY_AGG(DISTINCT a.overview->>'network') AS networks,
          ARRAY_AGG(DISTINCT a.overview->>'wave') AS waves
        FROM hat.validations v
        JOIN hat.atlases a ON a.id = ANY(v.atlas_ids)
        GROUP BY v.entity_id, v.validation_id;
      `);
    res.json(queryResult.rows.map(dbValidationToApiValidation));
  }
);
