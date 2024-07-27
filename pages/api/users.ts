import {
  HCAAtlasTrackerDBUser,
  ROLE,
} from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { dbUserToApiUser } from "../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../app/common/entities";
import { query } from "../../app/services/database";
import { handler, method, role } from "../../app/utils/api-handler";

/**
 * API route for list of users. Optional `email` query paramter filters by email.
 */
export default handler(
  method(METHOD.GET),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    const queryResult =
      typeof req.query.email === "string"
        ? await query<HCAAtlasTrackerDBUser>(
            "SELECT * FROM hat.users WHERE email=$1",
            [req.query.email]
          )
        : await query<HCAAtlasTrackerDBUser>("SELECT * FROM hat.users");
    res.json(queryResult.rows.map(dbUserToApiUser));
  }
);
