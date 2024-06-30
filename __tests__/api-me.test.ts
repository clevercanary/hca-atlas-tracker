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
  USER_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/utils/pg-app-connect-config");

let initialUsers: HCAAtlasTrackerDBUser[];

beforeAll(async () => {
  await resetDatabase();
  initialUsers = (await query<HCAAtlasTrackerDBUser>("SELECT * FROM hat.users"))
    .rows;
});

afterAll(() => {
  endPgPool();
});

describe("/api/me", () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (await doMeRequest(USER_STAKEHOLDER, METHOD.POST))._getStatusCode()
    ).toEqual(405);
    await expectUsersToBeUnchanged();
  });

  it("returns error 401 for logged out user", async () => {
    expect((await doMeRequest())._getStatusCode()).toEqual(401);
    await expectUsersToBeUnchanged();
  });

  it("returns information for logged in unregistered user", async () => {
    const res = await doMeRequest(USER_UNREGISTERED);
    expect(res.statusCode).toEqual(200);
    const user: HCAAtlasTrackerActiveUser = res._getJSONData();
    expect(user.email).toEqual(USER_UNREGISTERED.email);
    expect(user.fullName).toEqual(USER_UNREGISTERED.name);
    expect(user.role).toEqual(ROLE.UNREGISTERED);
    expect(user.roleAssociatedResourceIds).toEqual([]);
    await expectUsersToBeUnchanged();
  });

  it("returns information for logged in user", async () => {
    const requestTime = Date.now();
    const res = await doMeRequest(USER_STAKEHOLDER);
    expect(res.statusCode).toEqual(200);
    const user: HCAAtlasTrackerActiveUser = res._getJSONData();
    expectActiveUserToMatchTest(user, USER_STAKEHOLDER);
    const userStakeholderFromDb = (
      await query<HCAAtlasTrackerDBUser>(
        "SELECT * FROM hat.users WHERE email=$1",
        [USER_STAKEHOLDER.email]
      )
    ).rows[0];
    const lastLoginTime = userStakeholderFromDb.last_login.getTime();
    expect(Math.abs(lastLoginTime - requestTime)).toBeLessThan(1000);

    const userContentAdminFromDb = (
      await query<HCAAtlasTrackerDBUser>(
        "SELECT * FROM hat.users WHERE email=$1",
        [USER_CONTENT_ADMIN.email]
      )
    ).rows[0];
    expect(userContentAdminFromDb.last_login.getFullYear()).toEqual(1970);
  });

  it("returns information for logged in user with INTEGRATION_LEAD role", async () => {
    const res = await doMeRequest(USER_INTEGRATION_LEAD_DRAFT);
    expect(res.statusCode).toEqual(200);
    const user: HCAAtlasTrackerActiveUser = res._getJSONData();
    expectActiveUserToMatchTest(user, USER_INTEGRATION_LEAD_DRAFT);
  });
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
  expect(activeUser.email).toEqual(testUser.email);
  expect(activeUser.fullName).toEqual(testUser.name);
  expect(activeUser.role).toEqual(testUser.role);
  expect(activeUser.roleAssociatedResourceIds).toEqual(
    testUser.roleAssociatedResourceIds ?? []
  );
}

async function doMeRequest(
  user?: TestUser,
  method = METHOD.GET
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await meHandler(req, res);
  return res;
}
