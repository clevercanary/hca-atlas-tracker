import { ROLE_GROUP } from "../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { HCAAtlasTrackerDBUserWithAssociatedResources } from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { dbUserToApiUser } from "../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../app/common/entities";
import { getAllUsers, getUserByEmail } from "../../app/services/users";
import {
  handler,
  method,
  NotFoundError,
  role,
} from "../../app/utils/api-handler";

/**
 * API route for list of users. Optional `email` query paramter filters by email.
 */
export default handler(
  method(METHOD.GET),
  role(ROLE_GROUP.READ),
  async (req, res) => {
    let users: HCAAtlasTrackerDBUserWithAssociatedResources[];
    if (typeof req.query.email === "string") {
      try {
        users = [await getUserByEmail(req.query.email)];
      } catch (e) {
        if (e instanceof NotFoundError) users = [];
        else throw e;
      }
    } else {
      users = await getAllUsers();
    }
    res.json(users.map(dbUserToApiUser));
  }
);
