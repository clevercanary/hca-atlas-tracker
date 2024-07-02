import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  INITIAL_TEST_ATLASES,
  USER_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "testing/constants";
import { TestAtlas, TestUser } from "testing/entities";
import { HCAAtlasTrackerAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { endPgPool } from "../app/services/database";
import atlasesHandler from "../pages/api/atlases";
import { resetDatabase } from "../testing/db-utils";
import { expectApiAtlasToMatchTest } from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/utils/pg-app-connect-config");

beforeAll(async () => {
  await resetDatabase();
});

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

  it("returns all atlases for logged in user with STAKEHOLDER role", async () => {
    const res = await doAtlasesRequest(USER_STAKEHOLDER);
    const data = res._getJSONData() as HCAAtlasTrackerAtlas[];
    expect(res._getStatusCode()).toEqual(200);
    expectApiAtlasesToIncludeTests(data, INITIAL_TEST_ATLASES);
  });

  it("returns all atlases for logged in user with INTEGRATION_LEAD role", async () => {
    const res = await doAtlasesRequest(USER_INTEGRATION_LEAD_DRAFT);
    const data = res._getJSONData() as HCAAtlasTrackerAtlas[];
    expect(res._getStatusCode()).toEqual(200);
    expectApiAtlasesToIncludeTests(data, INITIAL_TEST_ATLASES);
  });

  it("returns all atlases for logged in user with CONTENT_ADMIN role", async () => {
    const res = await doAtlasesRequest(USER_CONTENT_ADMIN);
    const data = res._getJSONData() as HCAAtlasTrackerAtlas[];
    expect(res._getStatusCode()).toEqual(200);
    expectApiAtlasesToIncludeTests(data, INITIAL_TEST_ATLASES);
  });
});

function expectApiAtlasesToIncludeTests(
  apiAtlases: HCAAtlasTrackerAtlas[],
  testAtlases: TestAtlas[]
): void {
  for (const testAtlas of testAtlases) {
    const apiAtlas = apiAtlases.find((a) => a.id === testAtlas.id);
    expect(apiAtlas).toBeDefined();
    if (!apiAtlas) return;
    expectApiAtlasToMatchTest(apiAtlas, testAtlas);
  }
}

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
