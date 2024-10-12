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
  COMMENT_BY_CELLXGENE_ADMIN_REPLY2_CELLXGENE_ADMIN,
  COMMENT_BY_CELLXGENE_ADMIN_ROOT,
  COMMENT_BY_CONTENT_ADMIN_FOO_REPLY1_STAKEHOLDER,
  COMMENT_BY_CONTENT_ADMIN_FOO_REPLY2_STAKEHOLDER2,
  COMMENT_BY_CONTENT_ADMIN_FOO_ROOT,
  COMMENT_BY_CONTENT_ADMIN_REPLY1_STAKEHOLDER,
  COMMENT_BY_CONTENT_ADMIN_REPLY2_ADMIN,
  COMMENT_BY_STAKEHOLDER2_REPLY2_STAKEHOLDER,
  COMMENT_BY_STAKEHOLDER2_REPLY3_CELLXGENE_ADMIN,
  COMMENT_BY_STAKEHOLDER2_ROOT,
  COMMENT_BY_STAKEHOLDER_FOO_REPLY1_ADMIN,
  COMMENT_BY_STAKEHOLDER_FOO_REPLY2_STAKEHOLDER2,
  COMMENT_BY_STAKEHOLDER_FOO_REPLY3_INTEGRATION_LEAD_DRAFT,
  COMMENT_BY_STAKEHOLDER_FOO_ROOT,
  COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER,
  COMMENT_BY_STAKEHOLDER_REPLY2_ADMIN,
  COMMENT_BY_STAKEHOLDER_REPLY3_INTEGRATION_LEAD_DRAFT,
  COMMENT_BY_STAKEHOLDER_ROOT,
  THREAD_ID_BY_CELLXGENE_ADMIN,
  THREAD_ID_BY_CONTENT_ADMIN,
  THREAD_ID_BY_CONTENT_ADMIN_FOO,
  THREAD_ID_BY_STAKEHOLDER,
  THREAD_ID_BY_STAKEHOLDER2,
  THREAD_ID_BY_STAKEHOLDER_FOO,
  USER_CELLXGENE_ADMIN,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
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

const COMMENT_BY_CELLXGENE_ADMIN_REPLY2_CELLXGENE_ADMIN_EDIT: CommentEditData =
  {
    text: "comment by cellxgene admin reply2 edit",
  };

let dbUsersByEmail: Record<string, HCAAtlasTrackerDBUser>;

beforeAll(async () => {
  await resetDatabase();
  dbUsersByEmail = await getDbUsersByEmail();
});

afterAll(async () => {
  endPgPool();
});

describe("/api/comments/[threadId]/comments/[commentId]", () => {
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
          COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER.id,
          METHOD.GET,
          true
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
          COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER.id,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("GET returns error 403 for disabled user", async () => {
    expect(
      (
        await doCommentTest(
          USER_DISABLED_CONTENT_ADMIN,
          THREAD_ID_BY_STAKEHOLDER,
          COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER.id,
          METHOD.GET,
          true
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

  it("GET returns comment when requested by user with CELLXGENE_ADMIN role", async () => {
    const res = await doCommentTest(
      USER_CELLXGENE_ADMIN,
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
          true,
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
          true,
          COMMENT_BY_STAKEHOLDER_ROOT_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_ROOT);
  });

  it("PATCH returns error 403 for disabled user", async () => {
    expect(
      (
        await doCommentTest(
          USER_DISABLED_CONTENT_ADMIN,
          THREAD_ID_BY_STAKEHOLDER,
          COMMENT_BY_STAKEHOLDER_ROOT.id,
          METHOD.PATCH,
          true,
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

  it("PATCH returns error 403 when user with CELLXGENE_ADMIN role attempts to edit another user's comment", async () => {
    expect(
      (
        await doCommentTest(
          USER_CELLXGENE_ADMIN,
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
    await testSuccessfulEdit(
      USER_STAKEHOLDER,
      THREAD_ID_BY_STAKEHOLDER,
      COMMENT_BY_STAKEHOLDER_ROOT.id,
      COMMENT_BY_STAKEHOLDER_ROOT_EDIT,
      COMMENT_BY_STAKEHOLDER_REPLY2_ADMIN
    );
  });

  it("PATCH updates user's own comment when requested by user with INTEGRATION_LEAD role", async () => {
    await testSuccessfulEdit(
      USER_INTEGRATION_LEAD_DRAFT,
      THREAD_ID_BY_STAKEHOLDER,
      COMMENT_BY_STAKEHOLDER_REPLY3_INTEGRATION_LEAD_DRAFT.id,
      COMMENT_BY_STAKEHOLDER_REPLY3_INTEGRATION_LEAD_DRAFT_EDIT,
      COMMENT_BY_STAKEHOLDER_REPLY2_ADMIN
    );
  });

  it("PATCH updates user's own comment when requested by user with CELLXGENE_ADMIN role", async () => {
    await testSuccessfulEdit(
      USER_CELLXGENE_ADMIN,
      THREAD_ID_BY_CELLXGENE_ADMIN,
      COMMENT_BY_CELLXGENE_ADMIN_REPLY2_CELLXGENE_ADMIN.id,
      COMMENT_BY_CELLXGENE_ADMIN_REPLY2_CELLXGENE_ADMIN_EDIT,
      COMMENT_BY_STAKEHOLDER_REPLY2_ADMIN
    );
  });

  it("PATCH updates another user's comment when requested by user with CONTENT_ADMIN role", async () => {
    const commentBefore = await getCommentFromDatabase(
      COMMENT_BY_CONTENT_ADMIN_REPLY1_STAKEHOLDER.id
    );
    expect(commentBefore?.updated_by).toEqual(
      dbUsersByEmail[USER_STAKEHOLDER.email].id
    );

    const updatedCommentFromDb = await testSuccessfulEdit(
      USER_CONTENT_ADMIN,
      THREAD_ID_BY_CONTENT_ADMIN,
      COMMENT_BY_CONTENT_ADMIN_REPLY1_STAKEHOLDER.id,
      COMMENT_BY_CONTENT_ADMIN_REPLY1_STAKEHOLDER_EDIT,
      COMMENT_BY_CONTENT_ADMIN_REPLY2_ADMIN
    );

    expect(updatedCommentFromDb.updated_by).toEqual(
      dbUsersByEmail[USER_CONTENT_ADMIN.email].id
    );
    expect(updatedCommentFromDb.created_by).toEqual(
      dbUsersByEmail[USER_STAKEHOLDER.email].id
    );
  });

  it("DELETE returns error 401 for logged out user", async () => {
    expect(
      (
        await doCommentTest(
          undefined,
          THREAD_ID_BY_STAKEHOLDER2,
          COMMENT_BY_STAKEHOLDER2_REPLY2_STAKEHOLDER.id,
          METHOD.DELETE,
          true
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
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectCommentToBeUnchanged(
      COMMENT_BY_STAKEHOLDER2_REPLY2_STAKEHOLDER
    );
  });

  it("DELETE returns error 403 for disabled user", async () => {
    expect(
      (
        await doCommentTest(
          USER_DISABLED_CONTENT_ADMIN,
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

  it("DELETE returns error 400 when user with STAKEHOLDER role attempts to delete their own root comment", async () => {
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
    ).toEqual(400);
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

  it("DELETE returns error 400 when user with STAKEHOLDER role attempts to delete another user's root comment", async () => {
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
    ).toEqual(400);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_FOO_ROOT);
  });

  it("DELETE returns error 403 when user with INTEGRATION_LEAD role attempts to delete another user's non-root comment", async () => {
    expect(
      (
        await doCommentTest(
          USER_INTEGRATION_LEAD_DRAFT,
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

  it("DELETE returns error 400 when user with INTEGRATION_LEAD role attempts to delete another user's root comment", async () => {
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
    ).toEqual(400);
    await expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER_FOO_ROOT);
  });

  it("DELETE returns error 403 when user with CELLXGENE_ADMIN role attempts to delete another user's non-root comment", async () => {
    expect(
      (
        await doCommentTest(
          USER_CELLXGENE_ADMIN,
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

  it("DELETE returns error 400 when user with CELLXGENE_ADMIN role attempts to delete their own root comment", async () => {
    expect(
      (
        await doCommentTest(
          USER_CELLXGENE_ADMIN,
          THREAD_ID_BY_CELLXGENE_ADMIN,
          COMMENT_BY_CELLXGENE_ADMIN_ROOT.id,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectCommentToBeUnchanged(COMMENT_BY_CELLXGENE_ADMIN_ROOT);
  });

  it("DELETE returns error 400 when user with CONTENT_ADMIN role attempts to delete their own root comment", async () => {
    expect(
      (
        await doCommentTest(
          USER_CONTENT_ADMIN,
          THREAD_ID_BY_CONTENT_ADMIN_FOO,
          COMMENT_BY_CONTENT_ADMIN_FOO_ROOT.id,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectCommentToBeUnchanged(COMMENT_BY_CONTENT_ADMIN_FOO_ROOT);
  });

  it("DELETE deletes user's own non-root comment when requested by user with STAKEHOLDER role", async () => {
    await testSuccessfulDelete(
      USER_STAKEHOLDER2,
      THREAD_ID_BY_STAKEHOLDER_FOO,
      COMMENT_BY_STAKEHOLDER_FOO_REPLY2_STAKEHOLDER2,
      COMMENT_BY_STAKEHOLDER_FOO_REPLY1_ADMIN
    );
  });

  it("DELETE deletes user's own non-root comment when requested by user with INTEGRATION_LEAD role", async () => {
    await testSuccessfulDelete(
      USER_INTEGRATION_LEAD_DRAFT,
      THREAD_ID_BY_STAKEHOLDER_FOO,
      COMMENT_BY_STAKEHOLDER_FOO_REPLY3_INTEGRATION_LEAD_DRAFT,
      COMMENT_BY_STAKEHOLDER_FOO_REPLY1_ADMIN
    );
  });

  it("DELETE deletes user's own non-root comment when requested by user with CELLXGENE_ADMIN role", async () => {
    await testSuccessfulDelete(
      USER_CELLXGENE_ADMIN,
      THREAD_ID_BY_STAKEHOLDER2,
      COMMENT_BY_STAKEHOLDER2_REPLY3_CELLXGENE_ADMIN,
      COMMENT_BY_STAKEHOLDER_FOO_REPLY1_ADMIN
    );
  });

  it("DELETE deletes another user's non-root comment when requested by user with CONTENT_ADMIN role", async () => {
    await testSuccessfulDelete(
      USER_CONTENT_ADMIN,
      THREAD_ID_BY_CONTENT_ADMIN_FOO,
      COMMENT_BY_CONTENT_ADMIN_FOO_REPLY1_STAKEHOLDER,
      COMMENT_BY_CONTENT_ADMIN_FOO_REPLY2_STAKEHOLDER2
    );
  });
});

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

async function testSuccessfulEdit(
  user: TestUser,
  threadId: string,
  commentId: string,
  editData: CommentEditData,
  unchangedComment: TestComment
): Promise<HCAAtlasTrackerDBComment> {
  const res = await doCommentTest(
    user,
    threadId,
    commentId,
    METHOD.PATCH,
    false,
    editData
  );
  expect(res._getStatusCode()).toEqual(200);
  const updatedComment = res._getJSONData() as HCAAtlasTrackerComment;
  expect(updatedComment.text).toEqual(editData.text);
  const updatedCommentFromDb = await getCommentFromDatabase(commentId);
  expect(updatedCommentFromDb).toBeDefined();
  if (updatedCommentFromDb === undefined) throw new Error("Comment missing");
  expectDbCommentToMatch(updatedCommentFromDb, updatedComment);
  await expectCommentToBeUnchanged(unchangedComment);
  return updatedCommentFromDb;
}

async function testSuccessfulDelete(
  user: TestUser,
  threadId: string,
  comment: TestComment,
  unchangedComment: TestComment
): Promise<void> {
  await expectCommentToBeUnchanged(comment);
  expect(
    (
      await doCommentTest(user, threadId, comment.id, METHOD.DELETE, true)
    )._getStatusCode()
  ).toEqual(200);
  expect(await getCommentFromDatabase(comment.id)).toBeUndefined();
  await expectCommentToBeUnchanged(unchangedComment);
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
