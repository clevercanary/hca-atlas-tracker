import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerActiveUser } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import meHandler from "../pages/api/me";
import { USER_NONEXISTENT, USER_NORMAL } from "../testing/constants";
import { TestUser } from "../testing/entities";

jest.mock("../app/utils/pg-app-connect-config");

afterAll(() => {
  endPgPool();
});

describe("/api/me", () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (await doMeRequest(USER_NORMAL, METHOD.POST))._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect((await doMeRequest())._getStatusCode()).toEqual(401);
  });

  it("returns error 401 for user not in database", async () => {
    expect((await doMeRequest(USER_NONEXISTENT))._getStatusCode()).toEqual(401);
  });

  it("returns information for logged in user", async () => {
    const res = await doMeRequest(USER_NORMAL);
    expect(res.statusCode).toEqual(200);
    const user: HCAAtlasTrackerActiveUser = res._getJSONData();
    expect(user.email).toEqual(USER_NORMAL.email);
    expect(user.fullName).toEqual(USER_NORMAL.name);
    expect(user.role).toEqual(USER_NORMAL.role);
  });
});

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
