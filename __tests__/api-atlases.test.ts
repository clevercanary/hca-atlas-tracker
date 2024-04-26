import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { USER_CONTENT_ADMIN, USER_NORMAL } from "testing/constants";
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

  it("does not return draft atlases for logged out user", async () => {
    const data = (
      await doAtlasesRequest()
    )._getJSONData() as HCAAtlasTrackerAtlas[];
    expect(
      data.find((atlas) => atlas.status === ATLAS_STATUS.DRAFT)
    ).toBeUndefined();
  });

  it("does not return draft atlases for logged in user without CONTENT_ADMIN role", async () => {
    const data = (
      await doAtlasesRequest(USER_NORMAL)
    )._getJSONData() as HCAAtlasTrackerAtlas[];
    expect(
      data.find((atlas) => atlas.status === ATLAS_STATUS.DRAFT)
    ).toBeUndefined();
  });

  it("does return draft atlases for logged in user with CONTENT_ADMIN role", async () => {
    const data = (
      await doAtlasesRequest(USER_CONTENT_ADMIN)
    )._getJSONData() as HCAAtlasTrackerAtlas[];
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
