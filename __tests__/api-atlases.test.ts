import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "testing/constants";
import { TestUser } from "testing/entities";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerAtlas,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { endPgPool } from "../app/services/database";
import atlasesHandler from "../pages/api/atlases";

jest.mock("../app/utils/pg-app-connect-config");

afterAll(() => {
  endPgPool();
});

describe("/api/atlases", () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (await doAtlasesRequest(undefined, "POST"))._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect((await doAtlasesRequest())._getStatusCode()).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (await doAtlasesRequest(USER_UNREGISTERED))._getStatusCode()
    ).toEqual(403);
  });

  it("returns both public and draft atlases for logged in user with STAKEHOLDER role", async () => {
    const data = (
      await doAtlasesRequest(USER_STAKEHOLDER)
    )._getJSONData() as HCAAtlasTrackerAtlas[];
    expect(
      data.find((atlas) => atlas.status === ATLAS_STATUS.PUBLIC)
    ).toBeDefined();
    expect(
      data.find((atlas) => atlas.status === ATLAS_STATUS.DRAFT)
    ).toBeDefined();
  });

  it("returns both public and draft atlases for logged in user with CONTENT_ADMIN role", async () => {
    const data = (
      await doAtlasesRequest(USER_CONTENT_ADMIN)
    )._getJSONData() as HCAAtlasTrackerAtlas[];
    expect(
      data.find((atlas) => atlas.status === ATLAS_STATUS.PUBLIC)
    ).toBeDefined();
    expect(
      data.find((atlas) => atlas.status === ATLAS_STATUS.DRAFT)
    ).toBeDefined();
  });
});

async function doAtlasesRequest(
  user?: TestUser,
  method: "GET" | "POST" = "GET"
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await atlasesHandler(req, res);
  return res;
}
