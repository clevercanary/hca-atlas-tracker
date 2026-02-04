import { ROLE } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../app/common/entities";
import { query } from "../../../../app/services/database";
import {
  handler,
  handleRequiredParam,
  method,
  role,
} from "../../../../app/utils/api-handler";

/**
 * API route for setting a user as not disabled.
 */
export default handler(
  method(METHOD.POST),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    const id = handleRequiredParam(req, res, "id", /^\d+$/);
    if (id === null) return;
    const queryResult = await query(
      "UPDATE hat.users SET disabled=false WHERE id=$1",
      [id],
    );
    if (queryResult.rowCount === 0) {
      res.status(404).end();
      return;
    }
    res.status(200).end();
  },
);
