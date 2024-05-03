import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { NewUserData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { endPgPool, query } from "../app/services/database";
import createHandler from "../pages/api/users/create";
import {
  USER_CONTENT_ADMIN,
  USER_NEW,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { TestUser } from "../testing/entities";

jest.mock("../app/services/user-profile");
jest.mock("../app/utils/pg-app-connect-config");

const NEW_USER_DATA = {
  disabled: false,
  email: USER_NEW.email,
  full_name: USER_NEW.name,
  role: "",
};

afterAll(async () => {
  await query("DELETE FROM hat.users WHERE email=$1", [USER_NEW.email]);
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
          role: undefined as unknown as NewUserData["role"],
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates user entry", async () => {
    await doCreateTest(USER_CONTENT_ADMIN, NEW_USER_DATA);
    expect(
      (
        await query(
          "SELECT disabled, email, full_name, role FROM hat.users WHERE email=$1",
          [USER_NEW.email]
        )
      ).rows[0]
    ).toEqual(NEW_USER_DATA);
  });
});

async function doCreateTest(
  user: TestUser | undefined,
  newData: NewUserData,
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
