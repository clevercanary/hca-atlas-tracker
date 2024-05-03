import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { endPgPool, query } from "../app/services/database";
import disableHandler from "../pages/api/users/[id]/disable";
import {
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { TestUser } from "../testing/entities";

jest.mock("../app/services/user-profile");
jest.mock("../app/utils/pg-app-connect-config");

let userStakeholderId: string;
let nonexistentId: string;

beforeAll(async () => {
  userStakeholderId = (
    await query("SELECT id FROM hat.users WHERE email=$1", [
      USER_STAKEHOLDER.email,
    ])
  ).rows[0].id.toString();
  nonexistentId = (
    (await query("SELECT MAX(id) FROM hat.users")).rows[0].max + 1
  ).toString();
});

afterAll(async () => {
  await query("UPDATE hat.users SET disabled=false WHERE id=$1", [
    userStakeholderId,
  ]);
  endPgPool();
});

describe("/api/users/[id]/disable", () => {
  it("returns error 405 for non-POST request", async () => {
    expect(
      (
        await doDisableRequest(undefined, userStakeholderId, "GET")
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (await doDisableRequest(undefined, userStakeholderId))._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doDisableRequest(USER_UNREGISTERED, userStakeholderId)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 for logged in user with STAKEHOLDER role", async () => {
    expect(
      (
        await doDisableRequest(USER_STAKEHOLDER, userStakeholderId)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 400 when specified ID is non-numeric", async () => {
    expect(
      (await doDisableRequest(USER_CONTENT_ADMIN, "test"))._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 404 when specified user doesn't exist", async () => {
    expect(
      (
        await doDisableRequest(USER_CONTENT_ADMIN, nonexistentId)
      )._getStatusCode()
    ).toEqual(404);
  });

  it("sets disabled to true on specified user", async () => {
    await doDisableRequest(USER_CONTENT_ADMIN, userStakeholderId);
    const { disabled } = (
      await query("SELECT disabled FROM hat.users WHERE id=$1", [
        userStakeholderId,
      ])
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
