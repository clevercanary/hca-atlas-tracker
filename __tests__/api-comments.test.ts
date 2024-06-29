import { METHOD } from "app/common/entities";
import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerComment,
  HCAAtlasTrackerDBComment,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { NewCommentThreadData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { endPgPool, query } from "../app/services/database";
import commentsHandler from "../pages/api/comments";
import {
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import { withConsoleErrorHiding } from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const NEW_COMMENT_FOO_DATA: NewCommentThreadData = {
  text: "New comment foo",
};

const NEW_COMMENT_BAR_DATA: NewCommentThreadData = {
  text: "New comment bar",
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("/api/comments", () => {
  it("returns error 405 for non-POST request", async () => {
    expect(
      (
        await doCommentsTest(undefined, NEW_COMMENT_FOO_DATA, false, METHOD.GET)
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (await doCommentsTest(undefined, NEW_COMMENT_FOO_DATA))._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCommentsTest(USER_UNREGISTERED, NEW_COMMENT_FOO_DATA)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 400 when text is not a string", async () => {
    expect(
      (
        await doCommentsTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_COMMENT_FOO_DATA,
            text: 123,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when text is empty string", async () => {
    expect(
      (
        await doCommentsTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_COMMENT_FOO_DATA,
            text: "",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates and returns comment for user with STAKEHOLDER role", async () => {
    await testSuccessfulCreate(NEW_COMMENT_FOO_DATA, USER_STAKEHOLDER);
  });

  it("creates and returns comment for user with CONTENT_ADMIN role", async () => {
    await testSuccessfulCreate(NEW_COMMENT_BAR_DATA, USER_CONTENT_ADMIN);
  });
});

async function testSuccessfulCreate(
  newData: NewCommentThreadData,
  user: TestUser
): Promise<HCAAtlasTrackerDBComment> {
  const res = await doCommentsTest(user, newData);
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
  return newCommentFromDb;
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
  newData: Record<string, unknown>,
  hideConsoleError = false,
  method = METHOD.POST
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: newData,
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(
    () => commentsHandler(req, res),
    hideConsoleError
  );
  return res;
}
