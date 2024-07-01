import { ROLE } from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { newCommentThreadSchema } from "../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbCommentToApiComment } from "../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../../app/common/entities";
import {
  createValidationComment,
  deleteValidationComment,
} from "../../../../app/services/validations";
import {
  getRegisteredUserFromAuthorization,
  handleByMethod,
  handler,
  registeredUser,
  role,
} from "../../../../app/utils/api-handler";

const postHandler = handler(registeredUser, async (req, res) => {
  const validationId = req.query.validationId as string;
  const newComment = await createValidationComment(
    validationId,
    await newCommentThreadSchema.validate(req.body),
    await getRegisteredUserFromAuthorization(req.headers.authorization)
  );
  res.status(201).json(dbCommentToApiComment(newComment));
});

const deleteHandler = handler(role(ROLE.CONTENT_ADMIN), async (req, res) => {
  const validationId = req.query.validationId as string;
  await deleteValidationComment(validationId);
  res.status(200).end();
});

export default handleByMethod({
  [METHOD.DELETE]: deleteHandler,
  [METHOD.POST]: postHandler,
});
