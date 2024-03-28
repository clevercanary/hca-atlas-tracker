import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { endPgPool } from "../app/utils/api-handler";
import usersHandler from "../pages/api/users";
import {
  USER_CONTENT_ADMIN,
  USER_NONEXISTENT,
  USER_NORMAL,
} from "../testing/constants";
import { TestUser } from "../testing/entities";

jest.mock("../app/utils/pg-connect-config");

afterAll(() => {
  endPgPool();
});

describe("/api/users", () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (await doUsersRequest(undefined, undefined, "POST"))._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect((await doUsersRequest())._getStatusCode()).toEqual(401);
  });

  it("returns error 403 for logged in user without CONTENT_ADMIN role", async () => {
    expect((await doUsersRequest(USER_NORMAL))._getStatusCode()).toEqual(403);
  });

  it("returns multiple users when email parameter is absent", async () => {
    expect(
      (await doUsersRequest(USER_CONTENT_ADMIN))._getJSONData().length
    ).toBeGreaterThan(1);
  });

  it("returns singular user when email parameter is set to an existing user's email", async () => {
    expect(
      (
        await doUsersRequest(USER_CONTENT_ADMIN, USER_NORMAL.email)
      )._getJSONData().length
    ).toEqual(1);
  });

  it("returns no users when email parameter is set to a nonexistent user's email", async () => {
    expect(
      (
        await doUsersRequest(USER_CONTENT_ADMIN, USER_NONEXISTENT.email)
      )._getJSONData().length
    ).toEqual(0);
  });
});

async function doUsersRequest(
  user?: TestUser,
  email?: string,
  method: "GET" | "POST" = "GET"
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: {
      email,
    },
  });
  await usersHandler(req, res);
  return res;
}
