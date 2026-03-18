import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerAtlasSummary } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import publishedAtlasesHandler from "../pages/api/published-atlases";
import {
  INITIAL_TEST_ATLASES,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestAtlas, TestUser } from "../testing/entities";
import {
  expectAtlasSummaryToMatchTestAtlas,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

const TEST_ROUTE = "/api/published-atlases";

const INITIAL_PUBLISHED_TEST_ATLASES = INITIAL_TEST_ATLASES.filter(
  (atlas) => atlas.publishedAt,
);

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (
        await doPublishedAtlasesRequest(undefined, METHOD.POST, true)
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns all published atlases for logged out user", async () => {
    const res = await doPublishedAtlasesRequest(undefined, METHOD.GET, true);
    expect(res._getStatusCode()).toEqual(200);
    const data = res._getJSONData() as HCAAtlasTrackerAtlasSummary[];
    expectAtlasSummariesToMatchTests(data, INITIAL_PUBLISHED_TEST_ATLASES);
  });

  it("returns error 403 for disabled user", async () => {
    const res = await doPublishedAtlasesRequest(USER_DISABLED_CONTENT_ADMIN);
    expect(res._getStatusCode()).toEqual(200);
    const data = res._getJSONData() as HCAAtlasTrackerAtlasSummary[];
    expectAtlasSummariesToMatchTests(data, INITIAL_PUBLISHED_TEST_ATLASES);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns all atlases",
      TEST_ROUTE,
      publishedAtlasesHandler,
      METHOD.GET,
      role,
      undefined,
      undefined,
      false,
      (res) => {
        const data = res._getJSONData() as HCAAtlasTrackerAtlasSummary[];
        expect(res._getStatusCode()).toEqual(200);
        expectAtlasSummariesToMatchTests(data, INITIAL_PUBLISHED_TEST_ATLASES);
      },
    );
  }

  it("returns all atlases for logged in user with CONTENT_ADMIN role", async () => {
    const res = await doPublishedAtlasesRequest(USER_CONTENT_ADMIN);
    const data = res._getJSONData() as HCAAtlasTrackerAtlasSummary[];
    expect(res._getStatusCode()).toEqual(200);
    expectAtlasSummariesToMatchTests(data, INITIAL_PUBLISHED_TEST_ATLASES);
  });
});

function expectAtlasSummariesToMatchTests(
  atlasSummaries: HCAAtlasTrackerAtlasSummary[],
  testAtlases: TestAtlas[],
): void {
  expect(testAtlases).not.toHaveLength(0);
  expect(atlasSummaries).toHaveLength(testAtlases.length);
  for (const testAtlas of testAtlases) {
    const apiAtlas = atlasSummaries.find((a) => a.id === testAtlas.id);
    expect(apiAtlas).toBeDefined();
    if (!apiAtlas) return;
    expectAtlasSummaryToMatchTestAtlas(apiAtlas, testAtlas);
  }
}

async function doPublishedAtlasesRequest(
  user?: TestUser,
  method = METHOD.GET,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(
    () => publishedAtlasesHandler(req, res),
    hideConsoleError,
  );
  return res;
}
