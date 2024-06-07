import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerComponentAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import componentAtlasesHandler from "../pages/api/atlases/[atlasId]/component-atlases";
import {
  ATLAS_DRAFT,
  COMPONENT_ATLAS_DRAFT_BAR,
  COMPONENT_ATLAS_DRAFT_FOO,
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestComponentAtlas, TestUser } from "../testing/entities";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("/api/atlases/[id]/component-atlases", () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (
        await doComponentAtlasesRequest(ATLAS_DRAFT.id, undefined, METHOD.POST)
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when draft atlas component atlases are requested by logged out user", async () => {
    expect(
      (await doComponentAtlasesRequest(ATLAS_DRAFT.id))._getStatusCode()
    ).toEqual(401);
  });
  it("returns error 403 when draft atlas component atlases are requested by unregistered user", async () => {
    expect(
      (
        await doComponentAtlasesRequest(ATLAS_DRAFT.id, USER_UNREGISTERED)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns draft atlas component atlases when requested by logged in user with STAKEHOLDER role", async () => {
    const res = await doComponentAtlasesRequest(
      ATLAS_DRAFT.id,
      USER_STAKEHOLDER
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlases =
      res._getJSONData() as HCAAtlasTrackerComponentAtlas[];
    expect(componentAtlases).toHaveLength(2);
    expectComponentAtlasesToMatch(componentAtlases, [
      COMPONENT_ATLAS_DRAFT_FOO,
      COMPONENT_ATLAS_DRAFT_BAR,
    ]);
  });

  it("returns draft atlas component atlases when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doComponentAtlasesRequest(
      ATLAS_DRAFT.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlases =
      res._getJSONData() as HCAAtlasTrackerComponentAtlas[];
    expect(componentAtlases).toHaveLength(2);
    expectComponentAtlasesToMatch(componentAtlases, [
      COMPONENT_ATLAS_DRAFT_FOO,
      COMPONENT_ATLAS_DRAFT_BAR,
    ]);
  });
});

async function doComponentAtlasesRequest(
  atlasId: string,
  user?: TestUser,
  method = METHOD.GET
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: { atlasId },
  });
  await componentAtlasesHandler(req, res);
  return res;
}

function expectComponentAtlasesToMatch(
  componentAtlases: HCAAtlasTrackerComponentAtlas[],
  expectedTestComponentAtlases: TestComponentAtlas[]
): void {
  for (const testComponentAtlas of expectedTestComponentAtlases) {
    const componentAtlas = componentAtlases.find(
      (c) => c.id === testComponentAtlas.id
    );
    expect(componentAtlas).toBeDefined();
    if (!componentAtlas) continue;
    expect(componentAtlas.atlasId).toEqual(testComponentAtlas.atlasId);
    expect(componentAtlas.title).toEqual(testComponentAtlas.title);
  }
}