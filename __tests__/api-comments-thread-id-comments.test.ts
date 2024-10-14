import { METHOD } from "app/common/entities";
import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerComment,
  HCAAtlasTrackerDBComment,
  HCAAtlasTrackerDBUser,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { NewCommentData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { endPgPool, query } from "../app/services/database";
import commentsHandler from "../pages/api/comments/[threadId]/comments";
import {
  TEST_COMMENTS_BY_THREAD_ID,
  THREAD_ID_BY_CONTENT_ADMIN,
  THREAD_ID_BY_STAKEHOLDER,
  THREAD_ID_BY_STAKEHOLDER2,
  THREAD_ID_BY_STAKEHOLDER_FOO,
  USER_CELLXGENE_ADMIN,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { getDbUsersByEmail, resetDatabase } from "../testing/db-utils";
import { TestComment, TestUser } from "../testing/entities";
import { withConsoleErrorHiding } from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const THREAD_ID_NONEXISTENT = "f1d7ee3c-34ac-4d2e-86bb-d45f86d84fe4";

const NEW_COMMENT_FOO_DATA: NewCommentData = {
  text: "New comment foo",
};

const NEW_COMMENT_BAR_DATA: NewCommentData = {
  text: "New comment bar",
};

const NEW_COMMENT_BAZ_DATA: NewCommentData = {
  text: "New comment baz",
};

const NEW_COMMENT_FOOFOO_DATA: NewCommentData = {
  text: "New comment foofoo",
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
  it("returns error 405 for non-GET, non-POST request", async () => {
    expect(
      (
        await doCommentsTest(
          undefined,
          THREAD_ID_BY_STAKEHOLDER,
          NEW_COMMENT_FOO_DATA,
          false,
          METHOD.PUT
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("GET returns error 401 for logged out user", async () => {
    expect(
      (
        await doCommentsTest(
          undefined,
          THREAD_ID_BY_STAKEHOLDER,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("GET returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCommentsTest(
          USER_UNREGISTERED,
          THREAD_ID_BY_STAKEHOLDER,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("GET returns error 403 for disabled user", async () => {
    expect(
      (
        await doCommentsTest(
          USER_DISABLED_CONTENT_ADMIN,
          THREAD_ID_BY_STAKEHOLDER,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("GET returns error 404 for nonexistent thread", async () => {
    expect(
      (
        await doCommentsTest(
          USER_STAKEHOLDER,
          THREAD_ID_NONEXISTENT,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("GET returns thread comments when requested by user with STAKEHOLDER role", async () => {
    const res = await doCommentsTest(
      USER_STAKEHOLDER,
      THREAD_ID_BY_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const comments = res._getJSONData();
    expectApiCommentsToMatchTest(
      comments,
      TEST_COMMENTS_BY_THREAD_ID[THREAD_ID_BY_CONTENT_ADMIN]
    );
  });

  it("GET returns thread comments when requested by user with INTEGRATION_LEAD role", async () => {
    const res = await doCommentsTest(
      USER_INTEGRATION_LEAD_DRAFT,
      THREAD_ID_BY_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const comments = res._getJSONData();
    expectApiCommentsToMatchTest(
      comments,
      TEST_COMMENTS_BY_THREAD_ID[THREAD_ID_BY_CONTENT_ADMIN]
    );
  });

  it("GET returns thread comments when requested by user with CELLXGENE_ADMIN role", async () => {
    const res = await doCommentsTest(
      USER_CELLXGENE_ADMIN,
      THREAD_ID_BY_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const comments = res._getJSONData();
    expectApiCommentsToMatchTest(
      comments,
      TEST_COMMENTS_BY_THREAD_ID[THREAD_ID_BY_CONTENT_ADMIN]
    );
  });

  it("GET returns thread comments when requested by user with CONTENT_ADMIN role", async () => {
    const res = await doCommentsTest(
      USER_CONTENT_ADMIN,
      THREAD_ID_BY_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const comments = res._getJSONData();
    expectApiCommentsToMatchTest(
      comments,
      TEST_COMMENTS_BY_THREAD_ID[THREAD_ID_BY_CONTENT_ADMIN]
    );
  });

  it("POST returns error 401 for logged out user", async () => {
    expect(
      (
        await doCommentsTest(
          undefined,
          THREAD_ID_BY_STAKEHOLDER,
          NEW_COMMENT_FOO_DATA,
          true,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("POST returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCommentsTest(
          USER_UNREGISTERED,
          THREAD_ID_BY_STAKEHOLDER,
          NEW_COMMENT_FOO_DATA,
          true,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("POST returns error 403 for disabled user", async () => {
    expect(
      (
        await doCommentsTest(
          USER_DISABLED_CONTENT_ADMIN,
          THREAD_ID_BY_STAKEHOLDER,
          NEW_COMMENT_FOO_DATA,
          true,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("POST returns error 404 for nonexistent thread", async () => {
    expect(
      (
        await doCommentsTest(
          USER_STAKEHOLDER,
          THREAD_ID_NONEXISTENT,
          NEW_COMMENT_FOO_DATA,
          true,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("POST returns error 400 when text is not a string", async () => {
    expect(
      (
        await doCommentsTest(
          USER_CONTENT_ADMIN,
          THREAD_ID_BY_STAKEHOLDER,
          {
            ...NEW_COMMENT_FOO_DATA,
            text: 123,
          },
          true,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("POST returns error 400 when text is empty string", async () => {
    expect(
      (
        await doCommentsTest(
          USER_CONTENT_ADMIN,
          THREAD_ID_BY_STAKEHOLDER,
          {
            ...NEW_COMMENT_FOO_DATA,
            text: "",
          },
          true,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("POST creates and returns comment for user with STAKEHOLDER role", async () => {
    await testSuccessfulCreate(
      THREAD_ID_BY_CONTENT_ADMIN,
      NEW_COMMENT_FOO_DATA,
      USER_STAKEHOLDER
    );
  });

  it("POST creates and returns comment for user with INTEGRATION_LEAD role", async () => {
    await testSuccessfulCreate(
      THREAD_ID_BY_STAKEHOLDER2,
      NEW_COMMENT_BAZ_DATA,
      USER_INTEGRATION_LEAD_DRAFT
    );
  });

  it("POST creates and returns comment for user with CONTENT_ADMIN role", async () => {
    await testSuccessfulCreate(
      THREAD_ID_BY_STAKEHOLDER,
      NEW_COMMENT_BAR_DATA,
      USER_CONTENT_ADMIN
    );
  });

  it("POST creates and returns comment for user with CELLXGENE_ADMIN role", async () => {
    await testSuccessfulCreate(
      THREAD_ID_BY_STAKEHOLDER_FOO,
      NEW_COMMENT_FOOFOO_DATA,
      USER_CELLXGENE_ADMIN
    );
  });
});

async function testSuccessfulCreate(
  threadId: string,
  newData: NewCommentData,
  user: TestUser
): Promise<HCAAtlasTrackerDBComment> {
  const res = await doCommentsTest(user, threadId, newData, false, METHOD.POST);
  expect(res._getStatusCode()).toEqual(201);
  const newComment: HCAAtlasTrackerComment = res._getJSONData();
  expect(newComment.text).toEqual(newData.text);
  const threadCommentsFromDb = (
    await query<HCAAtlasTrackerDBComment>(
      "SELECT * FROM hat.comments WHERE thread_id=$1",
      [newComment.threadId]
    )
  ).rows;
  expectDbCommentsToMatchTest(
    threadCommentsFromDb.slice(0, threadCommentsFromDb.length - 1),
    TEST_COMMENTS_BY_THREAD_ID[threadId]
  );
  const newCommentFromDb =
    threadCommentsFromDb[threadCommentsFromDb.length - 1];
  expect(newCommentFromDb.id).toEqual(newComment.id);
  expectDbCommentToMatch(newCommentFromDb, newComment);
  return newCommentFromDb;
}

function expectApiCommentsToMatchTest(
  apiComments: HCAAtlasTrackerComment[],
  testComments: TestComment[]
): void {
  expect(apiComments).toHaveLength(testComments.length);
  for (const [i, apiComment] of apiComments.entries()) {
    expectApiCommentToMatchTest(apiComment, testComments[i]);
  }
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

async function doCommentsTest(
  user: TestUser | undefined,
  threadId: string,
  newData?: Record<string, unknown>,
  hideConsoleError = false,
  method = METHOD.GET
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: newData,
    headers: { authorization: user?.authorization },
    method,
    query: {
      threadId,
    },
  });
  await withConsoleErrorHiding(
    () => commentsHandler(req, res),
    hideConsoleError
  );
  return res;
}
