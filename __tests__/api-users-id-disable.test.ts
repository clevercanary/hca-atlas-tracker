import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { endPgPool, query } from "../app/utils/api-handler";
import disableHandler from "../pages/api/users/[id]/disable";
import { USER_CONTENT_ADMIN, USER_NORMAL } from "../testing/constants";
import { TestUser } from "../testing/entities";

let userNormalId: string;

beforeAll(async () => {
  userNormalId = (
    await query("SELECT id FROM hat.users WHERE email=$1", [USER_NORMAL.email])
  ).rows[0].id.toString();
});

afterAll(async () => {
  await query("UPDATE hat.users SET disabled=false WHERE id=$1", [
    userNormalId,
  ]);
  endPgPool();
});

describe("/api/users/[id]/disable", () => {
  it("returns error 405 for non-POST request", async () => {
    expect(
      (await doDisableRequest(undefined, userNormalId, "GET"))._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (await doDisableRequest(undefined, userNormalId))._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 for logged in user without CONTENT_ADMIN role", async () => {
    expect(
      (await doDisableRequest(USER_NORMAL, userNormalId))._getStatusCode()
    ).toEqual(403);
  });

  it("sets disabled to true on specified user", async () => {
    await doDisableRequest(USER_CONTENT_ADMIN, userNormalId);
    const { disabled } = (
      await query("SELECT disabled FROM hat.users WHERE id=$1", [userNormalId])
    ).rows[0];
    expect(disabled).toBe(true);
  });
});

async function doDisableRequest(
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
  await disableHandler(req, res);
  return res;
}
