import { ROLE } from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { userEditSchema } from "../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbUserToApiUser } from "../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../app/common/entities";
import { getUserById, updateUser } from "../../../app/services/users";
import {
  handleByMethod,
  handler,
  handleRequiredParam,
  role,
} from "../../../app/utils/api-handler";

const getHandler = handler(role(ROLE.CONTENT_ADMIN), async (req, res) => {
  const id = handleRequiredParam(req, res, "id", /^\d+$/);
  if (id === null) return;
  res.status(200).json(dbUserToApiUser(await getUserById(Number(id))));
});

const patchHandler = handler(role(ROLE.CONTENT_ADMIN), async (req, res) => {
  const id = handleRequiredParam(req, res, "id", /^\d+$/);
  if (id === null) return;
  const editInfo = await userEditSchema.validate(req.body);
  res.status(201).json(dbUserToApiUser(await updateUser(Number(id), editInfo)));
});

export default handleByMethod({
  [METHOD.GET]: getHandler,
  [METHOD.PATCH]: patchHandler,
});
