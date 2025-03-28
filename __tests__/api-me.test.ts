import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerActiveUser,
  HCAAtlasTrackerDBUser,
  ROLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import meHandler from "../pages/api/me";
import {
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import {
  expectIsDefined,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

const TEST_ROUTE = "/api/me";

let initialUsers: HCAAtlasTrackerDBUser[];

beforeAll(async () => {
  await resetDatabase();
  initialUsers = (await query<HCAAtlasTrackerDBUser>("SELECT * FROM hat.users"))
    .rows;
});

afterAll(() => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for non-PUT request", async () => {
    expect(
      (await doMeRequest(USER_STAKEHOLDER, METHOD.GET))._getStatusCode()
    ).toEqual(405);
    await expectUsersToBeUnchanged();
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (await doMeRequest(undefined, undefined, true))._getStatusCode()
    ).toEqual(401);
    await expectUsersToBeUnchanged();
  });

  it("returns information for previously-unregistered user", async () => {
    expect(await getDbUserByEmail(USER_UNREGISTERED.email)).toBeUndefined();
    const res = await doMeRequest(USER_UNREGISTERED);
    expect(res.statusCode).toEqual(200);
    const user: HCAAtlasTrackerActiveUser = res._getJSONData();
    expect(user.disabled).toEqual(false);
    expect(user.email).toEqual(USER_UNREGISTERED.email);
    expect(user.fullName).toEqual(USER_UNREGISTERED.name);
    expect(user.role).toEqual(ROLE.STAKEHOLDER);
    expect(user.roleAssociatedResourceIds).toEqual([]);
    expect(await getDbUserByEmail(USER_UNREGISTERED.email)).toBeDefined();

    await query("DELETE FROM hat.users WHERE email=$1", [
      USER_UNREGISTERED.email,
    ]);
  });

  it("returns information for logged in user", async () => {
    const requestTime = Date.now();
    const res = await doMeRequest(USER_CONTENT_ADMIN);
    expect(res.statusCode).toEqual(200);
    const user: HCAAtlasTrackerActiveUser = res._getJSONData();
    expectActiveUserToMatchTest(user, USER_CONTENT_ADMIN);
    const userContentAdminFromDb = await getDbUserByEmail(
      USER_CONTENT_ADMIN.email
    );
    if (!expectIsDefined(userContentAdminFromDb)) return;
    const lastLoginTime = userContentAdminFromDb.last_login.getTime();
    expect(Math.abs(lastLoginTime - requestTime)).toBeLessThan(1000);

    const userStakeholderFromDb = await getDbUserByEmail(
      USER_STAKEHOLDER.email
    );
    expect(userStakeholderFromDb?.last_login.getFullYear()).toEqual(1970);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns own user information",
      TEST_ROUTE,
      meHandler,
      METHOD.PUT,
      role,
      undefined,
      undefined,
      false,
      (res, testUser) => {
        expect(res.statusCode).toEqual(200);
        const user: HCAAtlasTrackerActiveUser = res._getJSONData();
        expectActiveUserToMatchTest(user, testUser);
      }
    );
  }
});

async function expectUsersToBeUnchanged(): Promise<void> {
  const currentUsers = (
    await query<HCAAtlasTrackerDBUser>("SELECT * FROM hat.users")
  ).rows;
  expect(currentUsers).toEqual(initialUsers);
}

function expectActiveUserToMatchTest(
  activeUser: HCAAtlasTrackerActiveUser,
  testUser: TestUser
): void {
  expect(activeUser.disabled).toEqual(testUser.disabled);
  expect(activeUser.email).toEqual(testUser.email);
  expect(activeUser.fullName).toEqual(testUser.name);
  expect(activeUser.role).toEqual(testUser.role);
  expect(activeUser.roleAssociatedResourceIds).toEqual(
    testUser.roleAssociatedResourceIds ?? []
  );
}

async function doMeRequest(
  user?: TestUser,
  method = METHOD.PUT,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await await withConsoleErrorHiding(
    () => meHandler(req, res),
    hideConsoleError
  );
  return res;
}

async function getDbUserByEmail(
  email: string
): Promise<HCAAtlasTrackerDBUser | undefined> {
  return (
    await query<HCAAtlasTrackerDBUser>(
      "SELECT * FROM hat.users WHERE email=$1",
      [email]
    )
  ).rows[0];
}
