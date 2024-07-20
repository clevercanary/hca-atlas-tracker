import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { testApiRole } from "testing/utils";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import disableHandler from "../pages/api/users/[id]/disable";
import {
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";

jest.mock("../app/services/user-profile");
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const TEST_ROUTE = "/api/users/[id]/disable";

let userStakeholderId: string;
let nonexistentId: string;

beforeAll(async () => {
  await resetDatabase();
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
  endPgPool();
});

describe(TEST_ROUTE, () => {
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

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      disableHandler,
      METHOD.POST,
      role,
      getQueryValues(userStakeholderId),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(403);
      }
    );
  }

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
    query: getQueryValues(targetId),
  });
  await disableHandler(req, res);
  return res;
}

function getQueryValues(id: string): Record<string, string> {
  return { id };
}
