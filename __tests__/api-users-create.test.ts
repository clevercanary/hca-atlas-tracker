import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBUser,
  HCAAtlasTrackerUser,
  ROLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { NewUserData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import createHandler from "../pages/api/users/create";
import {
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_NEW,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import {
  expectDbUserToMatchInputData,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const TEST_ROUTE = "/api/users/create";

const NEW_USER_DATA: NewUserData = {
  disabled: false,
  email: USER_NEW.email,
  fullName: USER_NEW.name,
  role: ROLE.STAKEHOLDER,
  roleAssociatedResourceIds: [],
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for non-POST request", async () => {
    expect(
      (
        await doCreateTest(undefined, NEW_USER_DATA, false, METHOD.GET)
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (await doCreateTest(undefined, NEW_USER_DATA))._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (await doCreateTest(USER_UNREGISTERED, NEW_USER_DATA))._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 for disabled user", async () => {
    expect(
      (
        await doCreateTest(USER_DISABLED_CONTENT_ADMIN, NEW_USER_DATA)
      )._getStatusCode()
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      createHandler,
      METHOD.POST,
      role,
      undefined,
      NEW_USER_DATA,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(403);
      }
    );
  }

  it("returns error 400 when email value is not an email", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_USER_DATA,
            email: "notanemail",
          },
          true,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when email value has trailing whitespace", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_USER_DATA,
            email: NEW_USER_DATA.email + " ",
          },
          true,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when role is undefined", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_USER_DATA,
            role: undefined,
          },
          true,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when role is not an actual role", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          {
            ...NEW_USER_DATA,
            role: "notarole",
          },
          true,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates and returns user entry", async () => {
    const res = await doCreateTest(USER_CONTENT_ADMIN, NEW_USER_DATA);
    expect(res._getStatusCode()).toEqual(201);
    const newUser = res._getJSONData() as HCAAtlasTrackerUser;
    expect(newUser.disabled).toEqual(NEW_USER_DATA.disabled);
    expect(newUser.email).toEqual(NEW_USER_DATA.email);
    expect(newUser.fullName).toEqual(NEW_USER_DATA.fullName);
    expect(newUser.role).toEqual(NEW_USER_DATA.role);
    expect(newUser.roleAssociatedResourceIds).toEqual(
      NEW_USER_DATA.roleAssociatedResourceIds
    );

    const newUserFromDb = (
      await query<HCAAtlasTrackerDBUser>(
        "SELECT * FROM hat.users WHERE email=$1",
        [USER_NEW.email]
      )
    ).rows[0];

    await expectDbUserToMatchInputData(newUserFromDb, NEW_USER_DATA);
  });
});

async function doCreateTest(
  user: TestUser | undefined,
  newData: Record<string, unknown>,
  hideConsoleError = false,
  method: "GET" | "POST" = "POST"
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: newData,
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(() => createHandler(req, res), hideConsoleError);
  return res;
}
