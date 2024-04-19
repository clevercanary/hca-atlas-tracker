import { ValidationError } from "yup";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBAtlasOverview,
} from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewAtlasData,
  newAtlasSchema,
} from "../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbAtlasToApiAtlas } from "../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../app/common/entities";
import {
  handler,
  method,
  query,
  respondValidationError,
  role,
} from "../../../app/utils/api-handler";

/**
 * API route for creating an atlas. Atlas information is provided as a JSON body.
 */
export default handler(
  method(METHOD.POST),
  role("CONTENT_ADMIN"),
  async (req, res) => {
    let newInfo: NewAtlasData;
    try {
      newInfo = await newAtlasSchema.validate(req.body);
    } catch (e) {
      if (e instanceof ValidationError) {
        respondValidationError(res, e);
        return;
      } else {
        throw e;
      }
    }
    const newOverview: HCAAtlasTrackerDBAtlasOverview = {
      integrationLead: newInfo.integrationLead,
      network: newInfo.network,
      shortName: newInfo.shortName,
      version: newInfo.version,
      wave: newInfo.wave,
    };
    const queryResult = await query<HCAAtlasTrackerDBAtlas>(
      "INSERT INTO hat.atlases (overview, source_datasets, status) VALUES ($1, $2, $3) RETURNING *",
      [JSON.stringify(newOverview), "[]", ATLAS_STATUS.DRAFT]
    );
    res.status(201).json(dbAtlasToApiAtlas(queryResult.rows[0]));
  }
);
