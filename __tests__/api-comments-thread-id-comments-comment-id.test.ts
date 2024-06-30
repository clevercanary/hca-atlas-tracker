import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerComment,
  HCAAtlasTrackerDBComment,
  HCAAtlasTrackerDBUser,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { CommentEditData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import commentHandler from "../pages/api/comments/[threadId]/comments/[commentId]";
import {
  COMMENT_BY_CONTENT_ADMIN_FOO_REPLY1_STAKEHOLDER,
  COMMENT_BY_CONTENT_ADMIN_FOO_REPLY2_STAKEHOLDER2,
  COMMENT_BY_CONTENT_ADMIN_REPLY1_STAKEHOLDER,
  COMMENT_BY_CONTENT_ADMIN_REPLY2_ADMIN,
  COMMENT_BY_STAKEHOLDER2_REPLY2_STAKEHOLDER,
  COMMENT_BY_STAKEHOLDER2_ROOT,
  COMMENT_BY_STAKEHOLDER_FOO_REPLY1_ADMIN,
  COMMENT_BY_STAKEHOLDER_FOO_REPLY2_STAKEHOLDER2,
  COMMENT_BY_STAKEHOLDER_FOO_REPLY3_INTEGRATION_LEAD_DRAFT,
  COMMENT_BY_STAKEHOLDER_FOO_ROOT,
  COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER,
  COMMENT_BY_STAKEHOLDER_REPLY2_ADMIN,
  COMMENT_BY_STAKEHOLDER_REPLY3_INTEGRATION_LEAD_DRAFT,
  COMMENT_BY_STAKEHOLDER_ROOT,
  TEST_COMMENTS_BY_THREAD_ID,
  THREAD_ID_BY_CONTENT_ADMIN,
  THREAD_ID_BY_CONTENT_ADMIN_FOO,
  THREAD_ID_BY_STAKEHOLDER,
  THREAD_ID_BY_STAKEHOLDER2,
  THREAD_ID_BY_STAKEHOLDER_FOO,
  USER_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_STAKEHOLDER,
  USER_STAKEHOLDER2,
  USER_UNREGISTERED,
} from "../testing/constants";
import { getDbUsersByEmail, resetDatabase } from "../testing/db-utils";
import { TestComment, TestUser } from "../testing/entities";
import { withConsoleErrorHiding } from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const COMMENT_BY_STAKEHOLDER_ROOT_EDIT: CommentEditData = {
  text: "comment by stakeholder root edit",
};

const COMMENT_BY_STAKEHOLDER_REPLY3_INTEGRATION_LEAD_DRAFT_EDIT: CommentEditData =
  {
    text: "comment by stakeholder repl3 edit",
  };

const COMMENT_BY_CONTENT_ADMIN_REPLY1_STAKEHOLDER_EDIT: CommentEditData = {
  text: "comment by content admin reply1 edit",
};

let dbUsersByEmail: Record<string, HCAAtlasTrackerDBUser>;

beforeAll(async () => {
  await resetDatabase();
  dbUsersByEmail = await getDbUsersByEmail();
});

afterAll(async () => {
  endPgPool();
});

describe("/api/comments/[threadId]/comments", () => {
  it("returns error 405 for PUT request", async () => {
    expect(
      (
        await doCommentTest(
          undefined,
          THREAD_ID_BY_STAKEHOLDER,
          COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER.id,
          METHOD.PUT,
          false
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("GET returns error 401 for logged out user", async () => {
    expect(
      (
        await doCommentTest(
          undefined,
          THREAD_ID_BY_STAKEHOLDER,
          COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER.id
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("GET returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCommentTest(
          USER_UNREGISTERED,
          THREAD_ID_BY_STAKEHOLDER,
          COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER.id
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("GET returns error 404 when comment is requested via thread it doesn't exist in", async () => {
    expect(
      (
        await doCommentTest(
          USER_STAKEHOLDER,
          THREAD_ID_BY_CONTENT_ADMIN,
          COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER.id,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("GET returns comment when requested by user with STAKEHOLDER role", async () => {
    const res = await doCommentTest(
      USER_STAKEHOLDER,
      THREAD_ID_BY_STAKEHOLDER,
      COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER.id
    );
    expect(res._getStatusCode()).toEqual(200);
    const comment = res._getJSONData();
    expectApiCommentToMatchTest(
      comment,
      COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER
    );
  });

  it("GET returns comment when requested by user with INTEGRATION_LEAD role", async () => {
    const res = await doCommentTest(
      USER_INTEGRATION_LEAD_DRAFT,
      THREAD_ID_BY_STAKEHOLDER,
      COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER.id
    );
    expect(res._getStatusCode()).toEqual(200);
    const comment = res._getJSONData();
    expectApiCommentToMatchTest(
      comment,
      COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER
    );
  });

  it("GET returns comment when requested by user with CONTENT_ADMIN role", async () => {
    const res = await doCommentTest(
      USER_CONTENT_ADMIN,
      THREAD_ID_BY_STAKEHOLDER,
      COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER.id
    );
    expect(res._getStatusCode()).toEqual(200);
    const comment = res._getJSONData();
    expectApiCommentToMatchTest(
      comment,
      COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER
    );
  });

  it("PATCH returns error 401 for logged out user", async () => {
    expect(
      (
        await doCommentTest(
          undefined,
          THREAD_ID_BY_STAKEHOLDER,
          COMMENT_BY_STAKEHOLDER_ROOT.id,
          METHOD.PATCH,
          false,
          COMMENT_BY_STAKEHOLDER_ROOT_EDIT
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_ROOT);
  });

  it("PATCH returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCommentTest(
          USER_UNREGISTERED,
          THREAD_ID_BY_STAKEHOLDER,
          COMMENT_BY_STAKEHOLDER_ROOT.id,
          METHOD.PATCH,
          false,
          COMMENT_BY_STAKEHOLDER_ROOT_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_ROOT);
  });

  it("PATCH returns error 404 when comment is requested via thread it doesn't exist in", async () => {
    expect(
      (
        await doCommentTest(
          USER_STAKEHOLDER,
          THREAD_ID_BY_CONTENT_ADMIN,
          COMMENT_BY_STAKEHOLDER_ROOT.id,
          METHOD.PATCH,
          true,
          COMMENT_BY_STAKEHOLDER_ROOT_EDIT
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_ROOT);
  });

  it("PATCH returns error 400 when text is not a string", async () => {
    expect(
      (
        await doCommentTest(
          USER_STAKEHOLDER,
          THREAD_ID_BY_STAKEHOLDER,
          COMMENT_BY_STAKEHOLDER_ROOT.id,
          METHOD.PATCH,
          true,
          {
            ...COMMENT_BY_STAKEHOLDER_ROOT_EDIT,
            text: 123,
          }
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_ROOT);
  });

  it("PATCH returns error 400 when text is empty", async () => {
    expect(
      (
        await doCommentTest(
          USER_STAKEHOLDER,
          THREAD_ID_BY_STAKEHOLDER,
          COMMENT_BY_STAKEHOLDER_ROOT.id,
          METHOD.PATCH,
          true,
          {
            ...COMMENT_BY_STAKEHOLDER_ROOT_EDIT,
            text: "",
          }
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_ROOT);
  });

  it("PATCH returns error 403 when user with STAKEHOLDER role attempts to edit another user's comment", async () => {
    expect(
      (
        await doCommentTest(
          USER_STAKEHOLDER,
          THREAD_ID_BY_STAKEHOLDER,
          COMMENT_BY_STAKEHOLDER_REPLY2_ADMIN.id,
          METHOD.PATCH,
          true,
          COMMENT_BY_STAKEHOLDER_ROOT_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_REPLY2_ADMIN);
  });

  it("PATCH returns error 403 when user with INTEGRATION_LEAD role attempts to edit another user's comment", async () => {
    expect(
      (
        await doCommentTest(
          USER_INTEGRATION_LEAD_DRAFT,
          THREAD_ID_BY_STAKEHOLDER,
          COMMENT_BY_STAKEHOLDER_REPLY2_ADMIN.id,
          METHOD.PATCH,
          true,
          COMMENT_BY_STAKEHOLDER_ROOT_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_REPLY2_ADMIN);
  });

  it("PATCH updates user's own comment when requested by user with STAKEHOLDER role", async () => {
    const res = await doCommentTest(
      USER_STAKEHOLDER,
      THREAD_ID_BY_STAKEHOLDER,
      COMMENT_BY_STAKEHOLDER_ROOT.id,
      METHOD.PATCH,
      true,
      COMMENT_BY_STAKEHOLDER_ROOT_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedComment = res._getJSONData() as HCAAtlasTrackerComment;
    expect(updatedComment.text).toEqual(COMMENT_BY_STAKEHOLDER_ROOT_EDIT.text);
    const updatedCommentFromDb = await getCommentFromDatabase(
      COMMENT_BY_STAKEHOLDER_ROOT.id
    );
    expect(updatedCommentFromDb).toBeDefined();
    if (updatedCommentFromDb === undefined) return;
    expectDbCommentToMatch(updatedCommentFromDb, updatedComment);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_REPLY2_ADMIN);
  });

  it("PATCH updates user's own comment when requested by user with INTEGRATION_LEAD role", async () => {
    const res = await doCommentTest(
      USER_INTEGRATION_LEAD_DRAFT,
      THREAD_ID_BY_STAKEHOLDER,
      COMMENT_BY_STAKEHOLDER_REPLY3_INTEGRATION_LEAD_DRAFT.id,
      METHOD.PATCH,
      true,
      COMMENT_BY_STAKEHOLDER_REPLY3_INTEGRATION_LEAD_DRAFT_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedComment = res._getJSONData() as HCAAtlasTrackerComment;
    expect(updatedComment.text).toEqual(
      COMMENT_BY_STAKEHOLDER_REPLY3_INTEGRATION_LEAD_DRAFT_EDIT.text
    );
    const updatedCommentFromDb = await getCommentFromDatabase(
      COMMENT_BY_STAKEHOLDER_REPLY3_INTEGRATION_LEAD_DRAFT.id
    );
    expect(updatedCommentFromDb).toBeDefined();
    if (updatedCommentFromDb === undefined) return;
    expectDbCommentToMatch(updatedCommentFromDb, updatedComment);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_REPLY2_ADMIN);
  });

  it("PATCH updates another user's comment when requested by user with CONTENT_ADMIN role", async () => {
    const commentBefore = await getCommentFromDatabase(
      COMMENT_BY_CONTENT_ADMIN_REPLY1_STAKEHOLDER.id
    );
    expect(commentBefore?.updated_by).toEqual(
      dbUsersByEmail[USER_STAKEHOLDER.email].id
    );
    const res = await doCommentTest(
      USER_CONTENT_ADMIN,
      THREAD_ID_BY_CONTENT_ADMIN,
      COMMENT_BY_CONTENT_ADMIN_REPLY1_STAKEHOLDER.id,
      METHOD.PATCH,
      true,
      COMMENT_BY_CONTENT_ADMIN_REPLY1_STAKEHOLDER_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedComment = res._getJSONData() as HCAAtlasTrackerComment;
    expect(updatedComment.text).toEqual(
      COMMENT_BY_CONTENT_ADMIN_REPLY1_STAKEHOLDER_EDIT.text
    );
    const updatedCommentFromDb = await getCommentFromDatabase(
      COMMENT_BY_CONTENT_ADMIN_REPLY1_STAKEHOLDER.id
    );
    expect(updatedCommentFromDb).toBeDefined();
    if (updatedCommentFromDb === undefined) return;
    expectDbCommentToMatch(updatedCommentFromDb, updatedComment);

    expect(updatedCommentFromDb.updated_by).toEqual(
      dbUsersByEmail[USER_CONTENT_ADMIN.email].id
    );
    expect(updatedCommentFromDb.created_by).toEqual(
      dbUsersByEmail[USER_STAKEHOLDER.email].id
    );

    await expectCommentToBeUnchanged(COMMENT_BY_CONTENT_ADMIN_REPLY2_ADMIN);
  });

  it("DELETE returns error 401 for logged out user", async () => {
    expect(
      (
        await doCommentTest(
          undefined,
          THREAD_ID_BY_STAKEHOLDER2,
          COMMENT_BY_STAKEHOLDER2_REPLY2_STAKEHOLDER.id,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectCommentToBeUnchanged(
      COMMENT_BY_STAKEHOLDER2_REPLY2_STAKEHOLDER
    );
  });

  it("DELETE returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCommentTest(
          USER_UNREGISTERED,
          THREAD_ID_BY_STAKEHOLDER2,
          COMMENT_BY_STAKEHOLDER2_REPLY2_STAKEHOLDER.id,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectCommentToBeUnchanged(
      COMMENT_BY_STAKEHOLDER2_REPLY2_STAKEHOLDER
    );
  });

  it("DELETE returns error 404 when comment is requested via thread it doesn't exist it", async () => {
    expect(
      (
        await doCommentTest(
          USER_STAKEHOLDER,
          THREAD_ID_BY_CONTENT_ADMIN,
          COMMENT_BY_STAKEHOLDER2_REPLY2_STAKEHOLDER.id,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectCommentToBeUnchanged(
      COMMENT_BY_STAKEHOLDER2_REPLY2_STAKEHOLDER
    );
  });

  it("DELETE returns error 403 when user with STAKEHOLDER role attempts to delete their own root comment", async () => {
    expect(
      (
        await doCommentTest(
          USER_STAKEHOLDER2,
          THREAD_ID_BY_STAKEHOLDER2,
          COMMENT_BY_STAKEHOLDER2_ROOT.id,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER2_ROOT);
  });

  it("DELETE returns error 403 when user with STAKEHOLDER role attempts to delete another user's non-root comment", async () => {
    expect(
      (
        await doCommentTest(
          USER_STAKEHOLDER2,
          THREAD_ID_BY_STAKEHOLDER2,
          COMMENT_BY_STAKEHOLDER2_REPLY2_STAKEHOLDER.id,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectCommentToBeUnchanged(
      COMMENT_BY_STAKEHOLDER2_REPLY2_STAKEHOLDER
    );
  });

  it("DELETE returns error 403 when user with STAKEHOLDER role attempts to delete another user's root comment", async () => {
    expect(
      (
        await doCommentTest(
          USER_STAKEHOLDER2,
          THREAD_ID_BY_STAKEHOLDER_FOO,
          COMMENT_BY_STAKEHOLDER_FOO_ROOT.id,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_FOO_ROOT);
  });

  it("DELETE returns error 403 when user with INTEGRATION_LEAD role attempts to delete another user's root comment", async () => {
    expect(
      (
        await doCommentTest(
          USER_INTEGRATION_LEAD_DRAFT,
          THREAD_ID_BY_STAKEHOLDER_FOO,
          COMMENT_BY_STAKEHOLDER_FOO_ROOT.id,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_FOO_ROOT);
  });

  it("DELETE deletes user's own non-root comment when requested by user with STAKEHOLDER role", async () => {
    await expectCommentToBeUnchanged(
      COMMENT_BY_STAKEHOLDER_FOO_REPLY2_STAKEHOLDER2
    );
    expect(
      (
        await doCommentTest(
          USER_STAKEHOLDER2,
          THREAD_ID_BY_STAKEHOLDER_FOO,
          COMMENT_BY_STAKEHOLDER_FOO_REPLY2_STAKEHOLDER2.id,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(200);
    expect(
      await getCommentFromDatabase(
        COMMENT_BY_STAKEHOLDER_FOO_REPLY2_STAKEHOLDER2.id
      )
    ).toBeUndefined();
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_FOO_REPLY1_ADMIN);
  });

  it("DELETE deletes user's own non-root comment when requested by user with INTEGRATION_LEAD role", async () => {
    await expectCommentToBeUnchanged(
      COMMENT_BY_STAKEHOLDER_FOO_REPLY3_INTEGRATION_LEAD_DRAFT
    );
    expect(
      (
        await doCommentTest(
          USER_INTEGRATION_LEAD_DRAFT,
          THREAD_ID_BY_STAKEHOLDER_FOO,
          COMMENT_BY_STAKEHOLDER_FOO_REPLY3_INTEGRATION_LEAD_DRAFT.id,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(200);
    expect(
      await getCommentFromDatabase(
        COMMENT_BY_STAKEHOLDER_FOO_REPLY3_INTEGRATION_LEAD_DRAFT.id
      )
    ).toBeUndefined();
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_FOO_REPLY1_ADMIN);
  });

  it("DELETE deletes another user's non-root comment when requested by user with CONTENT_ADMIN role", async () => {
    await expectCommentToBeUnchanged(
      COMMENT_BY_CONTENT_ADMIN_FOO_REPLY1_STAKEHOLDER
    );
    expect(
      (
        await doCommentTest(
          USER_CONTENT_ADMIN,
          THREAD_ID_BY_CONTENT_ADMIN_FOO,
          COMMENT_BY_CONTENT_ADMIN_FOO_REPLY1_STAKEHOLDER.id,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(200);
    expect(
      await getCommentFromDatabase(
        COMMENT_BY_CONTENT_ADMIN_FOO_REPLY1_STAKEHOLDER.id
      )
    ).toBeUndefined();
    await expectCommentToBeUnchanged(
      COMMENT_BY_CONTENT_ADMIN_FOO_REPLY2_STAKEHOLDER2
    );
  });

  it("DELETE deletes another user's thread via root comment when requested by user with CONTENT_ADMIN role", async () => {
    await expectThreadToBeUnchanged(THREAD_ID_BY_STAKEHOLDER2);
    expect(
      (
        await doCommentTest(
          USER_CONTENT_ADMIN,
          THREAD_ID_BY_STAKEHOLDER2,
          COMMENT_BY_STAKEHOLDER2_ROOT.id,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(200);
    expect(
      await getThreadCommentsFromDatabase(THREAD_ID_BY_STAKEHOLDER2)
    ).toHaveLength(0);
    expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_ROOT);
  });
});

async function expectThreadToBeUnchanged(threadId: string): Promise<void> {
  expectDbCommentsToMatchTest(
    await getThreadCommentsFromDatabase(threadId),
    TEST_COMMENTS_BY_THREAD_ID[threadId]
  );
}

async function expectCommentToBeUnchanged(
  testComment: TestComment
): Promise<void> {
  const dbComment = await getCommentFromDatabase(testComment.id);
  expect(dbComment).toBeDefined();
  if (dbComment === undefined) return;
  expectDbCommentToMatchTest(dbComment, testComment);
}

function expectApiCommentToMatchTest(
  dbComment: HCAAtlasTrackerComment,
  testComment: TestComment
): void {
  expect(dbComment.createdAt).toEqual(testComment.createdAt);
  expect(dbComment.createdBy).toEqual(
    dbUsersByEmail[testComment.createdBy.email].id
  );
  expect(dbComment.id).toEqual(testComment.id);
  expect(dbComment.text).toEqual(testComment.text);
  expect(dbComment.threadId).toEqual(testComment.threadId);
  expect(dbComment.updatedAt).toEqual(testComment.createdAt);
  expect(dbComment.updatedBy).toEqual(
    dbUsersByEmail[testComment.createdBy.email].id
  );
}

function expectDbCommentsToMatchTest(
  dbComments: HCAAtlasTrackerDBComment[],
  testComments: TestComment[]
): void {
  expect(dbComments).toHaveLength(testComments.length);
  for (const [i, dbComment] of dbComments.entries()) {
    expectDbCommentToMatchTest(dbComment, testComments[i]);
  }
}

function expectDbCommentToMatchTest(
  dbComment: HCAAtlasTrackerDBComment,
  testComment: TestComment
): void {
  expect(dbComment.created_at).toEqual(new Date(testComment.createdAt));
  expect(dbComment.created_by).toEqual(
    dbUsersByEmail[testComment.createdBy.email].id
  );
  expect(dbComment.id).toEqual(testComment.id);
  expect(dbComment.text).toEqual(testComment.text);
  expect(dbComment.thread_id).toEqual(testComment.threadId);
  expect(dbComment.updated_at).toEqual(new Date(testComment.createdAt));
  expect(dbComment.updated_by).toEqual(
    dbUsersByEmail[testComment.createdBy.email].id
  );
}

function expectDbCommentToMatch(
  dbComment: HCAAtlasTrackerDBComment,
  apiComment: HCAAtlasTrackerComment
): void {
  expect(dbComment.created_at.toISOString()).toEqual(apiComment.createdAt);
  expect(dbComment.created_by).toEqual(apiComment.createdBy);
  expect(dbComment.id).toEqual(apiComment.id);
  expect(dbComment.text).toEqual(apiComment.text);
  expect(dbComment.thread_id).toEqual(apiComment.threadId);
  expect(dbComment.updated_at.toISOString()).toEqual(apiComment.updatedAt);
  expect(dbComment.updated_by).toEqual(apiComment.updatedBy);
}

async function doCommentTest(
  user: TestUser | undefined,
  threadId: string,
  commentId: string,
  method = METHOD.GET,
  hideConsoleError = false,
  editData?: Record<string, unknown>
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: editData,
    headers: { authorization: user?.authorization },
    method,
    query: {
      commentId,
      threadId,
    },
  });
  await withConsoleErrorHiding(
    () => commentHandler(req, res),
    hideConsoleError
  );
  return res;
}

async function getThreadCommentsFromDatabase(
  threadId: string
): Promise<HCAAtlasTrackerDBComment[]> {
  return (
    await query<HCAAtlasTrackerDBComment>(
      "SELECT * FROM hat.comments WHERE thread_id=$1",
      [threadId]
    )
  ).rows;
}

async function getCommentFromDatabase(
  commentId: string
): Promise<HCAAtlasTrackerDBComment | undefined> {
  return (
    await query<HCAAtlasTrackerDBComment>(
      "SELECT * FROM hat.comments WHERE id=$1",
      [commentId]
    )
  ).rows[0];
}
