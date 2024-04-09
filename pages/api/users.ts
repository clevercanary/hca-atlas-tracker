import { METHOD } from "../../app/common/entities";
import { handler, method, query, role } from "../../app/utils/api-handler";

/**
 * API route for list of users. Optional `email` query paramter filters by email.
 */
export default handler(
  method(METHOD.GET),
  role("CONTENT_ADMIN"),
  async (req, res) => {
    const queryResult =
      typeof req.query.email === "string"
        ? await query("SELECT * FROM hat.users WHERE email=$1", [
            req.query.email,
          ])
        : await query("SELECT * FROM hat.users");
    res.json(queryResult.rows);
  }
);
