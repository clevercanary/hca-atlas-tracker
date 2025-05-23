import { dbCommentToApiComment } from "../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { newCommentSchema } from "../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../app/common/entities";
import {
  createComment,
  getThreadComments,
} from "../../../../app/services/comments";
import {
  getRegisteredActiveUser,
  handleByMethod,
  handler,
  registeredUser,
} from "../../../../app/utils/api-handler";

const getHandler = handler(registeredUser, async (req, res) => {
  const threadId = req.query.threadId as string;
  res
    .status(200)
    .json((await getThreadComments(threadId)).map(dbCommentToApiComment));
});

const postHandler = handler(registeredUser, async (req, res) => {
  const threadId = req.query.threadId as string;
  res
    .status(201)
    .json(
      dbCommentToApiComment(
        await createComment(
          threadId,
          await newCommentSchema.validate(req.body),
          await getRegisteredActiveUser(req, res)
        )
      )
    );
});

export default handleByMethod({
  [METHOD.GET]: getHandler,
  [METHOD.POST]: postHandler,
});
