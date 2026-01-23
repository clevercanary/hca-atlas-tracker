import { dbCommentToApiComment } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { commentEditSchema } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../../app/common/entities";
import {
  deleteComment,
  getComment,
  updateComment,
} from "../../../../../app/services/comments";
import {
  getRegisteredActiveUser,
  handleByMethod,
  handler,
  registeredUser,
} from "../../../../../app/utils/api-handler";

const getHandler = handler(registeredUser, async (req, res) => {
  const threadId = req.query.threadId as string;
  const commentId = req.query.commentId as string;
  res
    .status(200)
    .json(dbCommentToApiComment(await getComment(threadId, commentId)));
});

const patchHandler = handler(registeredUser, async (req, res) => {
  const threadId = req.query.threadId as string;
  const commentId = req.query.commentId as string;
  const user = await getRegisteredActiveUser(req, res);
  res
    .status(200)
    .json(
      dbCommentToApiComment(
        await updateComment(
          threadId,
          commentId,
          await commentEditSchema.validate(req.body),
          user,
          user.role !== ROLE.CONTENT_ADMIN,
        ),
      ),
    );
});

const deleteHandler = handler(registeredUser, async (req, res) => {
  const threadId = req.query.threadId as string;
  const commentId = req.query.commentId as string;
  const user = await getRegisteredActiveUser(req, res);
  await deleteComment(
    threadId,
    commentId,
    user,
    user.role !== ROLE.CONTENT_ADMIN,
  );
  res.status(200).end();
});

export default handleByMethod({
  [METHOD.DELETE]: deleteHandler,
  [METHOD.GET]: getHandler,
  [METHOD.PATCH]: patchHandler,
});
