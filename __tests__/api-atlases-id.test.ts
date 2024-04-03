import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { endPgPool } from "../app/utils/api-handler";
import atlasHandler from "../pages/api/atlases/[id]";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  USER_CONTENT_ADMIN,
  USER_NORMAL,
} from "../testing/constants";
import { TestUser } from "../testing/entities";

jest.mock("../app/utils/pg-connect-config");

afterAll(() => {
  endPgPool();
});

describe("/api/atlases/[id]", () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (
        await doAtlasRequest(ATLAS_PUBLIC.id, undefined, "POST")
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns public atlas when requested by logged out user", async () => {
    const atlas = (
      await doAtlasRequest(ATLAS_PUBLIC.id)
    )._getJSONData() as HCAAtlasTrackerAtlas;
    expect(atlas.focus).toEqual(ATLAS_PUBLIC.focus);
  });

  it("returns public atlas when requested by logged in user without CONTENT_ADMIN role", async () => {
    const atlas = (
      await doAtlasRequest(ATLAS_PUBLIC.id, USER_NORMAL)
    )._getJSONData() as HCAAtlasTrackerAtlas;
    expect(atlas.focus).toEqual(ATLAS_PUBLIC.focus);
  });

  it("returns error 404 when draft atlas is requested by logged out user", async () => {
    expect((await doAtlasRequest(ATLAS_DRAFT.id))._getStatusCode()).toEqual(
      404
    );
  });

  it("returns error 404 when draft atlas is requested by logged in user without CONTENT_ADMIN role", async () => {
    expect(
      (await doAtlasRequest(ATLAS_DRAFT.id, USER_NORMAL))._getStatusCode()
    ).toEqual(404);
  });

  it("returns draft atlas when requested by logged in user with CONTENT_ADMIN role", async () => {
    const atlas = (
      await doAtlasRequest(ATLAS_DRAFT.id, USER_CONTENT_ADMIN)
    )._getJSONData() as HCAAtlasTrackerAtlas;
    expect(atlas.focus).toEqual(ATLAS_DRAFT.focus);
  });
});

async function doAtlasRequest(
  id: string,
  user?: TestUser,
  method: "GET" | "POST" = "GET"
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: { id },
  });
  await atlasHandler(req, res);
  return res;
}
