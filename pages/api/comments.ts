import { dbCommentToApiComment } from "../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { newCommentThreadSchema } from "../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../app/common/entities";
import { createCommentThread } from "../../app/services/comments";
import {
  getRegisteredUserFromAuthorization,
  handler,
  method,
  registeredUser,
} from "../../app/utils/api-handler";

export default handler(
  method(METHOD.POST),
  registeredUser,
  async (req, res) => {
    res
      .status(201)
      .json(
        dbCommentToApiComment(
          await createCommentThread(
            await newCommentThreadSchema.validate(req.body),
            await getRegisteredUserFromAuthorization(req.headers.authorization)
          )
        )
      );
  }
);
