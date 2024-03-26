import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { endPgPool, query } from "../app/utils/api-handler";
import enableHandler from "../pages/api/users/[id]/enable";
import {
  USER_CONTENT_ADMIN,
  USER_DISABLED,
  USER_NORMAL,
} from "../testing/constants";
import { TestUser } from "../testing/entities";

let userDisabledId: string;

beforeAll(async () => {
  userDisabledId = (
    await query("SELECT id FROM hat.users WHERE email=$1", [
      USER_DISABLED.email,
    ])
  ).rows[0].id.toString();
});

afterAll(async () => {
  await query("UPDATE hat.users SET disabled=true WHERE id=$1", [
    userDisabledId,
  ]);
  endPgPool();
});

describe("/api/users/[id]/enable", () => {
  it("returns error 401 for non-POST request", async () => {
    expect(
      (await doEnableRequest(undefined, userDisabledId, "GET"))._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (await doEnableRequest(undefined, userDisabledId))._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 for logged in user without CONTENT_ADMIN role", async () => {
    expect(
      (await doEnableRequest(USER_NORMAL, userDisabledId))._getStatusCode()
    ).toEqual(403);
  });

  it("sets disabled to false on specified user", async () => {
    await doEnableRequest(USER_CONTENT_ADMIN, userDisabledId);
    const { disabled } = (
      await query("SELECT disabled FROM hat.users WHERE id=$1", [
        userDisabledId,
      ])
    ).rows[0];
    expect(disabled).toBe(false);
  });
});

async function doEnableRequest(
  user: TestUser | undefined,
  targetId: string,
  method: "GET" | "POST" = "POST"
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: {
      id: targetId,
    },
  });
  await enableHandler(req, res);
  return res;
}
