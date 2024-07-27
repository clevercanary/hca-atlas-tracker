import { dbUserToApiUser } from "app/apis/catalog/hca-atlas-tracker/common/utils";
import { ROLE } from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../app/common/entities";
import { getAllUsers, getUserByEmail } from "../../app/services/users";
import { handler, method, role } from "../../app/utils/api-handler";

/**
 * API route for list of users. Optional `email` query paramter filters by email.
 */
export default handler(
  method(METHOD.GET),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    const users =
      typeof req.query.email === "string"
        ? [await getUserByEmail(req.query.email)]
        : await getAllUsers();
    res.json(users.map(dbUserToApiUser));
  }
);
