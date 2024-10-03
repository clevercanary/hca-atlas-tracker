import { ROLE } from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { userEditSchema } from "../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbUserToApiUser } from "../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../app/common/entities";
import { updateUser } from "../../../app/services/users";
import {
  handler,
  handleRequiredParam,
  method,
  role,
} from "../../../app/utils/api-handler";

/**
 * API route for updating a user. Updated user information is provided as a JSON body.
 */
export default handler(
  method(METHOD.PATCH),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    const id = handleRequiredParam(req, res, "id", /^\d+$/);
    if (id === null) return;
    const editInfo = await userEditSchema.validate(req.body);
    res
      .status(201)
      .json(dbUserToApiUser(await updateUser(Number(id), editInfo)));
  }
);
