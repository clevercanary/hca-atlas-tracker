import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { testApiRole } from "testing/utils";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import enableHandler from "../pages/api/users/[id]/enable";
import {
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";

jest.mock("../app/services/user-profile");
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const TEST_ROUTE = "/api/users/[id]/enable";

let userDisabledId: string;
let nonexistentId: string;

beforeAll(async () => {
  await resetDatabase();
  userDisabledId = (
    await query("SELECT id FROM hat.users WHERE email=$1", [
      USER_DISABLED.email,
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

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doEnableRequest(USER_UNREGISTERED, userDisabledId)
      )._getStatusCode()
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      enableHandler,
      METHOD.POST,
      role,
      getQueryValues(userDisabledId),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(403);
      }
    );
  }

  it("returns error 400 when specified ID is non-numeric", async () => {
    expect(
      (await doEnableRequest(USER_CONTENT_ADMIN, "test"))._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 404 when specified user doesn't exist", async () => {
    expect(
      (
        await doEnableRequest(USER_CONTENT_ADMIN, nonexistentId)
      )._getStatusCode()
    ).toEqual(404);
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
    query: getQueryValues(targetId),
  });
  await enableHandler(req, res);
  return res;
}

function getQueryValues(id: string): Record<string, string> {
  return { id };
}
