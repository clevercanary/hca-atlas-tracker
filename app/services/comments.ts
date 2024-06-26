import pg from "pg";
import {
  HCAAtlasTrackerDBComment,
  HCAAtlasTrackerDBUser,
} from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewCommentData,
  NewCommentThreadData,
} from "../../app/apis/catalog/hca-atlas-tracker/common/schema";
import {
  ForbiddenError,
  InvalidOperationError,
  NotFoundError,
} from "../../app/utils/api-handler";
import { query } from "./database";

/**
 * Get comments in a given thread.
 * @param threadId - ID of the thread to get comments from.
 * @returns comments from the thread, ordered by ascending creation date.
 */
export async function getThreadComments(
  threadId: string
): Promise<HCAAtlasTrackerDBComment[]> {
  const queryResult = await query<HCAAtlasTrackerDBComment>(
    "SELECT * FROM hat.comments WHERE thread_id=$1 ORDER BY created_at ASC",
    [threadId]
  );

  if (queryResult.rows.length === 0)
    throw new NotFoundError(`Comment thread with ID ${threadId} doesn't exist`);

  return queryResult.rows;
}

/**
 * Get a comment.
 * @param threadId - ID of the thread that the comment is accessed through.
 * @param commentId - ID of the comment to get.
 * @returns comment.
 */
export async function getComment(
  threadId: string,
  commentId: string
): Promise<HCAAtlasTrackerDBComment> {
  const queryResult = await query<HCAAtlasTrackerDBComment>(
    "SELECT * FROM hat.comments WHERE id=$1 AND thread_id=$2",
    [commentId, threadId]
  );

  if (queryResult.rows.length === 0)
    throw getCommentNotFoundError(threadId, commentId);

  return queryResult.rows[0];
}

/**
 * Create a comment thread.
 * @param inputData - Values for the new comment thread.
 * @param user - User creating the comment thread.
 * @param client - Postgres client to use.
 * @returns database model of new comment.
 */
export async function createCommentThread(
  inputData: NewCommentThreadData,
  user: HCAAtlasTrackerDBUser,
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBComment> {
  const newRowFields: Pick<
    HCAAtlasTrackerDBComment,
    "created_by" | "text" | "updated_by"
  > = {
    created_by: user.id,
    text: inputData.text,
    updated_by: user.id,
  };

  const queryResult = await query<HCAAtlasTrackerDBComment>(
    "INSERT INTO hat.comments (created_by, text, updated_by) VALUES ($1, $2, $3) RETURNING *",
    [newRowFields.created_by, newRowFields.text, newRowFields.updated_by],
    client
  );

  return queryResult.rows[0];
}

/**
 * Create a comment.
 * @param threadId - ID of the thread to add the comment to.
 * @param inputData - Values for the new comment.
 * @param user - User creating the comment.
 * @returns database model of new comment.
 */
export async function createComment(
  threadId: string,
  inputData: NewCommentData,
  user: HCAAtlasTrackerDBUser
): Promise<HCAAtlasTrackerDBComment> {
  const { exists: threadExists } = (
    await query<{ exists: boolean }>(
      "SELECT EXISTS(SELECT 1 FROM hat.comments WHERE thread_id=$1)",
      [threadId]
    )
  ).rows[0];

  if (!threadExists)
    throw new NotFoundError(`Thread with id ${threadId} doesn't exist`);

  const newRowFields: Pick<
    HCAAtlasTrackerDBComment,
    "created_by" | "text" | "thread_id" | "updated_by"
  > = {
    created_by: user.id,
    text: inputData.text,
    thread_id: threadId,
    updated_by: user.id,
  };

  const queryResult = await query<HCAAtlasTrackerDBComment>(
    "INSERT INTO hat.comments (created_by, text, thread_id, updated_by) VALUES ($1, $2, $3, $4) RETURNING *",
    [
      newRowFields.created_by,
      newRowFields.text,
      newRowFields.thread_id,
      newRowFields.updated_by,
    ]
  );

  return queryResult.rows[0];
}

/**
 * Update a comment.
 * @param threadId - ID of the thread that the comment is accessed through.
 * @param commentId - ID of the comment to update.
 * @param inputData - Values to update the comment with.
 * @param user - User updating the comment.
 * @param limitToOwnComments - Whether the comment must be one created by the user who's editing it.
 * @returns database model of updated comment.
 */
export async function updateComment(
  threadId: string,
  commentId: string,
  inputData: NewCommentData,
  user: HCAAtlasTrackerDBUser,
  limitToOwnComments: boolean
): Promise<HCAAtlasTrackerDBComment> {
  if (limitToOwnComments) {
    const existingComment = (
      await query<HCAAtlasTrackerDBComment>(
        "SELECT * FROM hat.comments WHERE id=$2 AND thread_id=$1",
        [threadId, commentId]
      )
    ).rows[0];
    if (existingComment && existingComment.created_by !== user.id)
      throw new ForbiddenError(`Must be user's own comment`);
  }

  const updatedRowFields: Pick<
    HCAAtlasTrackerDBComment,
    "text" | "updated_by"
  > = {
    text: inputData.text,
    updated_by: user.id,
  };

  const queryResult = await query<HCAAtlasTrackerDBComment>(
    "UPDATE hat.comments SET text=$1, updated_by=$2 WHERE id=$3 AND thread_id=$4 RETURNING *",
    [updatedRowFields.text, updatedRowFields.updated_by, commentId, threadId]
  );

  if (queryResult.rows.length === 0)
    throw getCommentNotFoundError(threadId, commentId);

  return queryResult.rows[0];
}

/**
 * Delete a comment.
 * @param threadId - ID of the thread that the comment is accessed through.
 * @param commentId - ID of the comment to delete.
 * @param user - User deleting the comment.
 * @param limitToOwnComments - Whether the comment must be one created by the user who's deleting it.
 */
export async function deleteComment(
  threadId: string,
  commentId: string,
  user: HCAAtlasTrackerDBUser,
  limitToOwnComments: boolean
): Promise<void> {
  const commentResult = await query<
    HCAAtlasTrackerDBComment & { is_root: boolean }
  >(
    "SELECT *, (created_at = (SELECT MIN(created_at) FROM hat.comments WHERE thread_id=$1)) AS is_root FROM hat.comments WHERE id=$2 AND thread_id=$1",
    [threadId, commentId]
  );

  if (commentResult.rows.length === 0)
    throw getCommentNotFoundError(threadId, commentId);

  const comment = commentResult.rows[0];

  if (comment.is_root)
    throw new InvalidOperationError("Cannot delete root comment of a thread");

  if (limitToOwnComments && comment.created_by !== user.id) {
    throw new ForbiddenError("Must be user's own comment");
  }

  await query("DELETE FROM hat.comments WHERE id=$1", [commentId]);
}

/**
 * Delete all comments in a given thread.
 * @param threadId - ID of the thread to delete.
 * @param client - Postgres client to use.
 */
export async function deleteCommentThread(
  threadId: string,
  client: pg.PoolClient
): Promise<void> {
  await client.query("DELETE FROM hat.comments WHERE thread_id=$1", [threadId]);
}

function getCommentNotFoundError(
  threadId: string,
  commentId: string
): NotFoundError {
  return new NotFoundError(
    `Comment with ID ${commentId} doesn't exist on thread with ID ${threadId}`
  );
}
