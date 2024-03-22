import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerAtlas,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { endPgPool } from "../app/utils/user";
import atlasesHandler from "../pages/api/entities/atlases";

afterAll(() => {
  endPgPool();
});

describe("/api/entities/atlases", () => {
  it("does not return draft atlases for logged out user", async () => {
    const data = await doAtlasesRequest();
    expect(
      Object.values(data).find((atlas) => atlas.status === ATLAS_STATUS.DRAFT)
    ).toBeUndefined();
  });

  it("does not return draft atlases for logged in user without CONTENT_ADMIN role", async () => {
    const data = await doAtlasesRequest("Bearer a");
    expect(
      Object.values(data).find((atlas) => atlas.status === ATLAS_STATUS.DRAFT)
    ).toBeUndefined();
  });

  it("does return draft atlases for logged in user with CONTENT_ADMIN role", async () => {
    const data = await doAtlasesRequest("Bearer b");
    expect(
      Object.values(data).find((atlas) => atlas.status === ATLAS_STATUS.DRAFT)
    ).toBeDefined();
  });
});

async function doAtlasesRequest(
  authorization?: string
): Promise<Record<number, HCAAtlasTrackerAtlas>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization },
  });
  await atlasesHandler(req, res);
  return res._getJSONData();
}
