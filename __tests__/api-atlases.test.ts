import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import atlasesHandler from "../pages/api/atlases";
import {
  ATLAS_DRAFT,
  ATLAS_WITH_DRAFT_LATEST_R0,
  ATLAS_WITH_DRAFT_LATEST_R1,
  ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  ATLAS_WITH_NON_LATEST_METADATA_ENTITIES,
  INITIAL_TEST_ATLASES,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestAtlas, TestUser } from "../testing/entities";
import {
  expectApiAtlasToMatchTest,
  expectIsDefined,
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

const TEST_ROUTE = "/api/atlases";

const EXTRA_INFO_TO_CHECK = [
  {
    atlasId: ATLAS_DRAFT.id,
    componentAtlasCount: 2,
    entrySheetValidationCount: 2,
    isLatest: true,
    sourceDatasetCount: 7,
  },
  {
    atlasId: ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
    componentAtlasCount: 2,
    entrySheetValidationCount: 3,
    isLatest: true,
    sourceDatasetCount: 0,
  },
  {
    atlasId: ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
    componentAtlasCount: 1,
    entrySheetValidationCount: 2,
    isLatest: true,
    sourceDatasetCount: 1,
  },
  {
    atlasId: ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
    componentAtlasCount: 3,
    entrySheetValidationCount: 0,
    isLatest: true,
    sourceDatasetCount: 2,
  },
  {
    atlasId: ATLAS_WITH_DRAFT_LATEST_R0.id,
    componentAtlasCount: 0,
    entrySheetValidationCount: 0,
    isLatest: false,
    sourceDatasetCount: 0,
  },
  {
    atlasId: ATLAS_WITH_DRAFT_LATEST_R1.id,
    componentAtlasCount: 0,
    entrySheetValidationCount: 0,
    isLatest: true,
    sourceDatasetCount: 0,
  },
];

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (await doAtlasesRequest(undefined, "POST", true))._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (await doAtlasesRequest(undefined, "GET", true))._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (await doAtlasesRequest(USER_UNREGISTERED, "GET", true))._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 for disabled user", async () => {
    expect(
      (await doAtlasesRequest(USER_DISABLED_CONTENT_ADMIN))._getStatusCode(),
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
        expectApiAtlasesToHaveExtraInfo(data);
      },
    );
  }

  it("returns all atlases for logged in user with CONTENT_ADMIN role", async () => {
    const res = await doAtlasesRequest(USER_CONTENT_ADMIN);
    const data = res._getJSONData() as HCAAtlasTrackerAtlas[];
    expect(res._getStatusCode()).toEqual(200);
    expectApiAtlasesToIncludeTests(data, INITIAL_TEST_ATLASES);
    expectApiAtlasesToHaveExtraInfo(data);
  });
});

function expectApiAtlasesToIncludeTests(
  apiAtlases: HCAAtlasTrackerAtlas[],
  testAtlases: TestAtlas[],
): void {
  for (const testAtlas of testAtlases) {
    const apiAtlas = apiAtlases.find((a) => a.id === testAtlas.id);
    expect(apiAtlas).toBeDefined();
    if (!apiAtlas) return;
    expectApiAtlasToMatchTest(apiAtlas, testAtlas);
  }
}

function expectApiAtlasesToHaveExtraInfo(
  apiAtlases: HCAAtlasTrackerAtlas[],
): void {
  for (const {
    atlasId,
    componentAtlasCount,
    entrySheetValidationCount,
    isLatest,
    sourceDatasetCount,
  } of EXTRA_INFO_TO_CHECK) {
    const apiAtlas = apiAtlases.find((a) => a.id === atlasId);
    if (!expectIsDefined(apiAtlas)) continue;
    expect(apiAtlas.componentAtlasCount).toEqual(componentAtlasCount);
    expect(apiAtlas.sourceDatasetCount).toEqual(sourceDatasetCount);
    expect(apiAtlas.entrySheetValidationCount).toEqual(
      entrySheetValidationCount,
    );
    expect(apiAtlas.isLatest).toEqual(isLatest);
  }
}

async function doAtlasesRequest(
  user?: TestUser,
  method: "GET" | "POST" = "GET",
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(
    () => atlasesHandler(req, res),
    hideConsoleError,
  );
  return res;
}
