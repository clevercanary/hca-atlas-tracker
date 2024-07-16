import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import atlasesHandler from "../pages/api/atlases";
import {
  INITIAL_TEST_ATLASES,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestAtlas, TestUser } from "../testing/entities";
import { expectApiAtlasToMatchTest, testApiRole } from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const TEST_ROUTE = "/api/atlases";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
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

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns all atlases",
      TEST_ROUTE,
      atlasesHandler,
      METHOD.GET,
      role,
      undefined,
      undefined,
      false,
      (res) => {
        const data = res._getJSONData() as HCAAtlasTrackerAtlas[];
        expect(res._getStatusCode()).toEqual(200);
        expectApiAtlasesToIncludeTests(data, INITIAL_TEST_ATLASES);
      }
    );
  }

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
