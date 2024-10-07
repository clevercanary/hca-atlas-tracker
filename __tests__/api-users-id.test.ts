import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBUser,
  HCAAtlasTrackerUser,
  ROLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { UserEditData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import userHandler from "../pages/api/users/[id]";
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
import {
  expectApiUserToMatchTest,
  expectDbUserToMatchInputData,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const TEST_ROUTE = "/api/users/[id]";

const USER_STAKEHOLDER_EDIT: UserEditData = {
  disabled: false,
  email: "test-stakeholder-edited@example.com",
  fullName: "test-stakeholder-edited",
  role: ROLE.STAKEHOLDER,
  roleAssociatedResourceIds: [],
};

let userIdsByEmail: Map<string, number>;

beforeAll(async () => {
  await resetDatabase();

  const usersResult = await query<Pick<HCAAtlasTrackerDBUser, "id" | "email">>(
    "SELECT id, email FROM hat.users"
  );
  userIdsByEmail = new Map(
    usersResult.rows.map(({ email, id }) => [email, id])
  );
  userIdsByEmail.set(USER_NONEXISTENT.email, INITIAL_TEST_USERS.length + 100);
});

afterAll(async () => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for non-GET, non-PATCH request", async () => {
    expect(
      (
        await doUserRequest(USER_STAKEHOLDER, undefined, false, METHOD.POST)
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when user is GET requested by logged out user", async () => {
    expect((await doUserRequest(USER_STAKEHOLDER))._getStatusCode()).toEqual(
      401
    );
  });

  it("returns error 403 when user is GET requested by unregistered user", async () => {
    expect(
      (
        await doUserRequest(USER_STAKEHOLDER, USER_UNREGISTERED)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("GET returns error 404 when nonexistent user is requested", async () => {
    expect(
      (
        await doUserRequest(USER_NONEXISTENT, USER_CONTENT_ADMIN, true)
      )._getStatusCode()
    ).toEqual(404);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns error 503",
      TEST_ROUTE,
      userHandler,
      METHOD.GET,
      role,
      () => getQueryValues(USER_STAKEHOLDER),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(403);
      }
    );
  }

  it("returns user when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doUserRequest(USER_STAKEHOLDER, USER_CONTENT_ADMIN);
    expect(res._getStatusCode()).toEqual(200);
    const user = res._getJSONData() as HCAAtlasTrackerUser;
    expectApiUserToMatchTest(user, USER_STAKEHOLDER);
  });

  it("returns error 401 when user is PATCH requested by logged out user", async () => {
    expect(
      (
        await doUserRequest(
          USER_STAKEHOLDER,
          undefined,
          false,
          METHOD.PATCH,
          USER_STAKEHOLDER_EDIT
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when user is PATCH requested by unregistered user", async () => {
    expect(
      (
        await doUserRequest(
          USER_STAKEHOLDER,
          USER_UNREGISTERED,
          false,
          METHOD.PATCH,
          USER_STAKEHOLDER_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("PATCH returns error 404 when nonexistent user is requested", async () => {
    expect(
      (
        await doUserRequest(
          USER_NONEXISTENT,
          USER_CONTENT_ADMIN,
          true,
          METHOD.PATCH,
          USER_STAKEHOLDER_EDIT
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns error 503",
      TEST_ROUTE,
      userHandler,
      METHOD.PATCH,
      role,
      () => getQueryValues(USER_STAKEHOLDER),
      USER_STAKEHOLDER_EDIT,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(403);
      }
    );
  }

  it("returns error 400 when email value is not an email", async () => {
    expect(
      (
        await doUserRequest(
          USER_STAKEHOLDER,
          USER_CONTENT_ADMIN,
          true,
          METHOD.PATCH,
          {
            ...USER_STAKEHOLDER_EDIT,
            email: "notanemail",
          }
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when role is undefined", async () => {
    expect(
      (
        await doUserRequest(
          USER_STAKEHOLDER,
          USER_CONTENT_ADMIN,
          true,
          METHOD.PATCH,
          {
            ...USER_STAKEHOLDER_EDIT,
            role: undefined,
          }
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when role is not an actual role", async () => {
    expect(
      (
        await doUserRequest(
          USER_STAKEHOLDER,
          USER_CONTENT_ADMIN,
          true,
          METHOD.PATCH,
          {
            ...USER_STAKEHOLDER_EDIT,
            role: "notarole",
          }
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("updates and returns user when PATCH requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doUserRequest(
      USER_STAKEHOLDER,
      USER_CONTENT_ADMIN,
      false,
      METHOD.PATCH,
      USER_STAKEHOLDER_EDIT
    );
    expect(res._getStatusCode()).toEqual(201);
    const user = res._getJSONData() as HCAAtlasTrackerUser;
    expectApiUserToMatchEdit(user, USER_STAKEHOLDER_EDIT);
    const updatedUserFromDb = (
      await query<HCAAtlasTrackerDBUser>(
        "SELECT * FROM hat.users WHERE email=$1",
        [USER_STAKEHOLDER_EDIT.email]
      )
    ).rows[0];
    await expectDbUserToMatchInputData(
      updatedUserFromDb,
      USER_STAKEHOLDER_EDIT
    );
  });
});

async function doUserRequest(
  targetUser: TestUser,
  user?: TestUser,
  hideConsoleError = false,
  method = METHOD.GET,
  updatedData?: Record<string, unknown>
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: updatedData,
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(targetUser),
  });
  await withConsoleErrorHiding(() => userHandler(req, res), hideConsoleError);
  return res;
}

function getQueryValues(user: TestUser): Record<string, string> {
  const userId = userIdsByEmail.get(user.email);
  if (!userId)
    throw new Error(`ID not found for test user email ${user.email}`);
  return { id: String(userId) };
}

function expectApiUserToMatchEdit(
  apiUser: HCAAtlasTrackerUser,
  editData: UserEditData
): void {
  expect(apiUser.disabled).toEqual(editData.disabled);
  expect(apiUser.email).toEqual(editData.email);
  expect(apiUser.fullName).toEqual(editData.fullName);
  expect(apiUser.role).toEqual(editData.role);
  expect(apiUser.roleAssociatedResourceIds).toEqual(
    editData.roleAssociatedResourceIds
  );
}
