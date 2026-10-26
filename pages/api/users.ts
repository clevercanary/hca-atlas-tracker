import { dbUserToApiUser } from "@/app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import {
  type HCAAtlasTrackerDBUserWithAssociatedResources,
  ROLE,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { getAllUsers, getUserByEmail } from "@/app/services/users";
import { NotFoundError } from "@/app/utils/api-errors";
import { handler, method, role } from "@/app/utils/api-handler";

/**
 * API route for list of users, restricted to content admins like the other
 * `/api/users/*` routes. Optional `email` query parameter filters by email.
 */
export default handler(
  method(METHOD.GET),
  role(ROLE.CONTENT_ADMIN),
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
  },
);
