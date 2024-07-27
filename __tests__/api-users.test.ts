import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  expectApiUserToMatchTest,
  expectIsDefined,
  testApiRole,
} from "testing/utils";
import { HCAAtlasTrackerUser } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import usersHandler from "../pages/api/users";
import {
  INITIAL_TEST_USERS,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_NONEXISTENT,
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

const TEST_ROUTE = "/api/users";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (await doUsersRequest(undefined, undefined, "POST"))._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect((await doUsersRequest())._getStatusCode()).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect((await doUsersRequest(USER_UNREGISTERED))._getStatusCode()).toEqual(
      403
    );
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns error 403",
      role,
      usersHandler,
      METHOD.GET,
      role,
      undefined,
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(403);
      }
    );
  }

  it("returns all users when email parameter is absent", async () => {
    const res = await doUsersRequest(USER_CONTENT_ADMIN);
    expect(res._getStatusCode()).toEqual(200);
    const users = res._getJSONData() as HCAAtlasTrackerUser[];
    for (const testUser of INITIAL_TEST_USERS) {
      const user = users.find((u) => u.email === testUser.email);
      if (!expectIsDefined(user)) continue;
      expectApiUserToMatchTest(user, testUser);
    }
  });

  it("returns singular user when email parameter is set to an existing user's email", async () => {
    const res = await doUsersRequest(
      USER_CONTENT_ADMIN,
      USER_STAKEHOLDER.email
    );
    expect(res._getStatusCode()).toEqual(200);
    const users = res._getJSONData() as HCAAtlasTrackerUser[];
    expect(users).toHaveLength(1);
    expectApiUserToMatchTest(users[0], USER_STAKEHOLDER);
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
