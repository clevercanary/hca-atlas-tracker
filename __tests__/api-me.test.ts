import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerActiveUser,
  ROLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import meHandler from "../pages/api/me";
import { USER_STAKEHOLDER, USER_UNREGISTERED } from "../testing/constants";
import { TestUser } from "../testing/entities";

jest.mock("../app/services/user-profile");
jest.mock("../app/utils/pg-app-connect-config");

afterAll(() => {
  endPgPool();
});

describe("/api/me", () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (await doMeRequest(USER_STAKEHOLDER, METHOD.POST))._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect((await doMeRequest())._getStatusCode()).toEqual(401);
  });

  it("returns information for logged in unregistered user", async () => {
    const res = await doMeRequest(USER_UNREGISTERED);
    expect(res.statusCode).toEqual(200);
    const user: HCAAtlasTrackerActiveUser = res._getJSONData();
    expect(user.email).toEqual(USER_UNREGISTERED.email);
    expect(user.fullName).toEqual(USER_UNREGISTERED.name);
    expect(user.role).toEqual(ROLE.UNREGISTERED);
  });

  it("returns information for logged in user", async () => {
    const res = await doMeRequest(USER_STAKEHOLDER);
    expect(res.statusCode).toEqual(200);
    const user: HCAAtlasTrackerActiveUser = res._getJSONData();
    expect(user.email).toEqual(USER_STAKEHOLDER.email);
    expect(user.fullName).toEqual(USER_STAKEHOLDER.name);
    expect(user.role).toEqual(USER_STAKEHOLDER.role);
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
