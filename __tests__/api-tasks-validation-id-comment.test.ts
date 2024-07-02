import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerComment,
  HCAAtlasTrackerDBComment,
  HCAAtlasTrackerDBUser,
  HCAAtlasTrackerDBValidation,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { NewCommentThreadData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import commentHandler from "../pages/api/tasks/[validationId]/comment";
import {
  COMMENT_BY_STAKEHOLDER2_ROOT,
  TEST_COMMENTS_BY_THREAD_ID,
  THREAD_ID_BY_STAKEHOLDER,
  USER_CONTENT_ADMIN,
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

const VALIDATION_RECORD_ID_NONEXISTENT = "67c71957-402d-4933-b602-10c8d1ad2198";

const NEW_COMMENT_FOO_DATA: NewCommentThreadData = {
  text: "New comment foo",
};

const NEW_COMMENT_BAR_DATA: NewCommentThreadData = {
  text: "New comment bar",
};

const NEW_COMMENT_BAZ_DATA: NewCommentThreadData = {
  text: "New comment baz",
};

let dbUsersByEmail: Record<string, HCAAtlasTrackerDBUser>;

let validationWithoutCommentA: HCAAtlasTrackerDBValidation;
let validationWithoutCommentB: HCAAtlasTrackerDBValidation;
let validationWithoutCommentC: HCAAtlasTrackerDBValidation;
let validationWithoutCommentD: HCAAtlasTrackerDBValidation;
let validationWithComment: HCAAtlasTrackerDBValidation;

beforeAll(async () => {
  await resetDatabase();

  dbUsersByEmail = await getDbUsersByEmail();

  const allValidations = (
    await query<HCAAtlasTrackerDBValidation>("SELECT * FROM hat.validations")
  ).rows;
  if (allValidations.length < 4) throw new Error("Not enough validations");
  [
    validationWithoutCommentA,
    validationWithoutCommentB,
    validationWithoutCommentC,
    validationWithoutCommentD,
    validationWithComment,
  ] = allValidations;
  await query("UPDATE hat.validations SET comment_thread_id=$1 WHERE id=$2", [
    THREAD_ID_BY_STAKEHOLDER,
    validationWithComment.id,
  ]);
});

afterAll(async () => {
  endPgPool();
});

describe("/api/tasks/[validationId]/comment", () => {
  it("returns error 405 for GET request", async () => {
    expect(
      (
        await doCommentRequest(
          validationWithoutCommentA.id,
          USER_STAKEHOLDER,
          METHOD.GET
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("POST returns error 401 for logged out user", async () => {
    expect(
      (
        await doCommentRequest(
          validationWithoutCommentA.id,
          undefined,
          METHOD.POST,
          NEW_COMMENT_FOO_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectCommentTextToNotExist(NEW_COMMENT_FOO_DATA.text);
  });

  it("POST returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCommentRequest(
          validationWithoutCommentA.id,
          USER_UNREGISTERED,
          METHOD.POST,
          NEW_COMMENT_FOO_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectCommentTextToNotExist(NEW_COMMENT_FOO_DATA.text);
  });

  it("POST returns error 404 for nonexistent validation", async () => {
    expect(
      (
        await doCommentRequest(
          VALIDATION_RECORD_ID_NONEXISTENT,
          USER_STAKEHOLDER,
          METHOD.POST,
          NEW_COMMENT_FOO_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectCommentTextToNotExist(NEW_COMMENT_FOO_DATA.text);
  });

  it("POST returns error 403 when validation already has a comment thread", async () => {
    expect(
      (
        await doCommentRequest(
          validationWithComment.id,
          USER_STAKEHOLDER,
          METHOD.POST,
          NEW_COMMENT_FOO_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectCommentTextToNotExist(NEW_COMMENT_FOO_DATA.text);
  });

  it("POST returns error 400 when text is not a string", async () => {
    expect(
      (
        await doCommentRequest(
          validationWithComment.id,
          USER_STAKEHOLDER,
          METHOD.POST,
          {
            ...NEW_COMMENT_FOO_DATA,
            text: 123,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("POST returns error 400 when text is empty string", async () => {
    expect(
      (
        await doCommentRequest(
          validationWithComment.id,
          USER_STAKEHOLDER,
          METHOD.POST,
          {
            ...NEW_COMMENT_FOO_DATA,
            text: "",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("POST adds and returns comment thread for user with STAKEHOLDER role", async () => {
    await testSuccessfulCreate(
      validationWithoutCommentA.id,
      NEW_COMMENT_FOO_DATA,
      USER_STAKEHOLDER
    );
  });

  it("POST adds and returns comment thread for user with INTEGRATION_LEAD role", async () => {
    await testSuccessfulCreate(
      validationWithoutCommentC.id,
      NEW_COMMENT_BAZ_DATA,
      USER_INTEGRATION_LEAD_DRAFT
    );
  });

  it("POST adds and returns comment thread for user with CONTENT_ADMIN role", async () => {
    await testSuccessfulCreate(
      validationWithoutCommentB.id,
      NEW_COMMENT_BAR_DATA,
      USER_CONTENT_ADMIN
    );
  });

  it("DELETE returns error 401 for logged out user", async () => {
    expect(
      (
        await doCommentRequest(
          validationWithComment.id,
          undefined,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(401);
    expectThreadToBeUnchanged(THREAD_ID_BY_STAKEHOLDER);
  });

  it("DELETE returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCommentRequest(
          validationWithComment.id,
          USER_UNREGISTERED,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    expectThreadToBeUnchanged(THREAD_ID_BY_STAKEHOLDER);
  });

  it("DELETE returns error 404 for nonexistent validation", async () => {
    expect(
      (
        await doCommentRequest(
          VALIDATION_RECORD_ID_NONEXISTENT,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("DELETE returns error 403 for user with STAKEHOLDER role", async () => {
    expect(
      (
        await doCommentRequest(
          validationWithComment.id,
          USER_STAKEHOLDER,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    expectThreadToBeUnchanged(THREAD_ID_BY_STAKEHOLDER);
  });

  it("DELETE returns error 403 for user with INTEGRATION_LEAD role", async () => {
    expect(
      (
        await doCommentRequest(
          validationWithComment.id,
          USER_INTEGRATION_LEAD_DRAFT,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    expectThreadToBeUnchanged(THREAD_ID_BY_STAKEHOLDER);
  });

  it("DELETE returns error 404 when validation doesn't have a comment thread", async () => {
    expect(
      (
        await doCommentRequest(
          validationWithoutCommentD.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("DELETE deletes comment thread when requested by user with CONTENT_ADMIN role", async () => {
    await expectThreadToBeUnchanged(THREAD_ID_BY_STAKEHOLDER);
    expect(
      (
        await doCommentRequest(
          validationWithComment.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);
    expect(
      await getThreadCommentsFromDatabase(THREAD_ID_BY_STAKEHOLDER)
    ).toHaveLength(0);
    expectCommentToBeUnchanged(COMMENT_BY_STAKEHOLDER2_ROOT);
  });
});

async function testSuccessfulCreate(
  validationId: string,
  newData: NewCommentThreadData,
  user: TestUser
): Promise<HCAAtlasTrackerDBComment> {
  const res = await doCommentRequest(validationId, user, METHOD.POST, newData);
  expect(res._getStatusCode()).toEqual(201);
  const newComment: HCAAtlasTrackerComment = res._getJSONData();
  expect(newComment.text).toEqual(newData.text);
  const threadCommentsFromDb = (
    await query<HCAAtlasTrackerDBComment>(
      "SELECT * FROM hat.comments WHERE thread_id=$1",
      [newComment.threadId]
    )
  ).rows;
  expect(threadCommentsFromDb).toHaveLength(1);
  const newCommentFromDb = threadCommentsFromDb[0];
  expect(newCommentFromDb.id).toEqual(newComment.id);
  expectDbCommentToMatch(newCommentFromDb, newComment);
  const validationFromDb = (
    await query<HCAAtlasTrackerDBValidation>(
      "SELECT * FROM hat.validations WHERE id=$1",
      [validationId]
    )
  ).rows[0];
  expect(validationFromDb.comment_thread_id).toEqual(newComment.threadId);
  return newCommentFromDb;
}

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

async function expectCommentTextToNotExist(text: string): Promise<void> {
  const matchingComments = (
    await query<HCAAtlasTrackerDBComment>(
      "SELECT * FROM hat.comments WHERE text=$1",
      [text]
    )
  ).rows;
  expect(matchingComments).toEqual([]);
}

async function doCommentRequest(
  validationId: string,
  user: TestUser | undefined,
  method: METHOD,
  data?: Record<string, unknown>,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: data,
    headers: { authorization: user?.authorization },
    method,
    query: {
      validationId,
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
