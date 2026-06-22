import { dbUserToApiUser } from "../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE } from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { userEditSchema } from "../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../app/common/entities";
import { getUserById, updateUser } from "../../../app/services/users";
import {
  getRequiredParam,
  handleByMethod,
  handler,
  role,
} from "../../../app/utils/api-handler";

const getHandler = handler(role(ROLE.CONTENT_ADMIN), async (req, res) => {
  const id = getRequiredParam(req, "id", /^\d+$/);
  res.status(200).json(dbUserToApiUser(await getUserById(Number(id))));
});

const patchHandler = handler(role(ROLE.CONTENT_ADMIN), async (req, res) => {
  const id = getRequiredParam(req, "id", /^\d+$/);
  const editInfo = await userEditSchema.validate(req.body);
  res.status(201).json(dbUserToApiUser(await updateUser(Number(id), editInfo)));
});

export default handleByMethod({
  [METHOD.GET]: getHandler,
  [METHOD.PATCH]: patchHandler,
});
