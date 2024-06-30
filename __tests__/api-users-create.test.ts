import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBUser,
  ROLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { NewUserData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { endPgPool, query } from "../app/services/database";
import createHandler from "../pages/api/users/create";
import {
  USER_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_NEW,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/utils/pg-app-connect-config");

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

describe("/api/users/create", () => {
  it("returns error 405 for non-POST request", async () => {
    expect(
      (await doCreateTest(undefined, NEW_USER_DATA, "GET"))._getStatusCode()
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

  it("returns error 403 for logged in user with STAKEHOLDER role", async () => {
    expect(
      (await doCreateTest(USER_STAKEHOLDER, NEW_USER_DATA))._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 for logged in user with INTEGRATION_LEAD role", async () => {
    expect(
      (
        await doCreateTest(USER_INTEGRATION_LEAD_DRAFT, NEW_USER_DATA)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 400 when email value is not an email", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, {
          ...NEW_USER_DATA,
          email: "notanemail",
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when role is undefined", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, {
          ...NEW_USER_DATA,
          role: undefined,
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when role is not an actual role", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, {
          ...NEW_USER_DATA,
          role: "notarole",
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates user entry", async () => {
    await doCreateTest(USER_CONTENT_ADMIN, NEW_USER_DATA);
    const newUserFromDb = (
      await query<HCAAtlasTrackerDBUser>(
        "SELECT * FROM hat.users WHERE email=$1",
        [USER_NEW.email]
      )
    ).rows[0];
    expect(newUserFromDb.disabled).toEqual(NEW_USER_DATA.disabled);
    expect(newUserFromDb.email).toEqual(NEW_USER_DATA.email);
    expect(newUserFromDb.full_name).toEqual(NEW_USER_DATA.fullName);
    expect(newUserFromDb.role).toEqual(NEW_USER_DATA.role);
    expect(newUserFromDb.role_associated_resource_ids).toEqual(
      NEW_USER_DATA.roleAssociatedResourceIds
    );
  });
});

async function doCreateTest(
  user: TestUser | undefined,
  newData: Record<string, unknown>,
  method: "GET" | "POST" = "POST"
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: newData,
    headers: { authorization: user?.authorization },
    method,
  });
  await createHandler(req, res);
  return res;
}
