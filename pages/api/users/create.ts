import { ROLE } from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { newUserSchema } from "../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbUserToApiUser } from "../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../app/common/entities";
import { createUser } from "../../../app/services/users";
import { handler, method, role } from "../../../app/utils/api-handler";

/**
 * API route for creating a user. New user information is provided as a JSON body.
 */
export default handler(
  method(METHOD.POST),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    const newInfo = await newUserSchema.validate(req.body);
    res.status(201).json(dbUserToApiUser(await createUser(newInfo)));
  }
);
