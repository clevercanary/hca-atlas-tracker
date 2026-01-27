import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerComponentAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import componentAtlasesHandler from "../pages/api/atlases/[atlasId]/component-atlases";
import {
  ATLAS_DRAFT,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  ATLAS_WITH_NON_LATEST_METADATA_ENTITIES,
  COMPONENT_ATLAS_ARCHIVED_BAR,
  COMPONENT_ATLAS_ARCHIVED_BAZ,
  COMPONENT_ATLAS_ARCHIVED_FOO,
  COMPONENT_ATLAS_ARCHIVED_FOOFOO,
  COMPONENT_ATLAS_DRAFT_BAR,
  COMPONENT_ATLAS_DRAFT_FOO,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ_W1,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W2,
  COMPONENT_ATLAS_WITH_ARCHIVED_LATEST_W2,
  COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3,
  FILE_C_COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestComponentAtlas, TestUser } from "../testing/entities";
import {
  expectApiComponentAtlasToMatchTest,
  expectIsDefined,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

const TEST_ROUTE = "/api/atlases/[id]/component-atlases";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (
        await doComponentAtlasesRequest(ATLAS_DRAFT.id, undefined, METHOD.POST)
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when draft atlas component atlases are requested by logged out user", async () => {
    expect(
      (
        await doComponentAtlasesRequest(
          ATLAS_DRAFT.id,
          undefined,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when draft atlas component atlases are requested by unregistered user", async () => {
    expect(
      (
        await doComponentAtlasesRequest(
          ATLAS_DRAFT.id,
          USER_UNREGISTERED,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when draft atlas component atlases are requested by disabled user", async () => {
    expect(
      (
        await doComponentAtlasesRequest(
          ATLAS_DRAFT.id,
          USER_DISABLED_CONTENT_ADMIN
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 400 when `archived` parameter is set to an invalid value", async () => {
    expect(
      (
        await doComponentAtlasesRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          USER_CONTENT_ADMIN,
          undefined,
          undefined,
          "invalid-valid"
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns component atlases",
      TEST_ROUTE,
      componentAtlasesHandler,
      METHOD.GET,
      role,
      getQueryValues(ATLAS_DRAFT.id),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const componentAtlases =
          res._getJSONData() as HCAAtlasTrackerComponentAtlas[];
        expectComponentAtlasesToMatch(
          componentAtlases,
          [COMPONENT_ATLAS_DRAFT_FOO, COMPONENT_ATLAS_DRAFT_BAR],
          [3, 2]
        );
      }
    );
  }

  it("returns draft atlas component atlases when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doComponentAtlasesRequest(
      ATLAS_DRAFT.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlases =
      res._getJSONData() as HCAAtlasTrackerComponentAtlas[];
    expectComponentAtlasesToMatch(
      componentAtlases,
      [COMPONENT_ATLAS_DRAFT_FOO, COMPONENT_ATLAS_DRAFT_BAR],
      [3, 2]
    );
  });

  it("returns component atlases only for latest file versions and only if they're non-archived", async () => {
    const res = await doComponentAtlasesRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlases =
      res._getJSONData() as HCAAtlasTrackerComponentAtlas[];
    expectComponentAtlasesToMatch(
      componentAtlases,
      [COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3],
      [1]
    );
    const componentAtlas = componentAtlases[0];
    if (!expectIsDefined(componentAtlas)) return;
    expect(componentAtlas.sizeBytes).toEqual(
      Number(FILE_C_COMPONENT_ATLAS_WITH_MULTIPLE_FILES.sizeBytes)
    );
  });

  it("returns only non-archived component atlases when `archived` parameter is explicitly set to `false`", async () => {
    const res = await doComponentAtlasesRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      USER_CONTENT_ADMIN,
      undefined,
      undefined,
      "false"
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlases =
      res._getJSONData() as HCAAtlasTrackerComponentAtlas[];
    expectComponentAtlasesToMatch(
      componentAtlases,
      [COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3],
      [1]
    );
  });

  it("returns only archived component atlases when `archived` parameter is set to `true`", async () => {
    const res = await doComponentAtlasesRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      USER_CONTENT_ADMIN,
      undefined,
      undefined,
      "true"
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlases =
      res._getJSONData() as HCAAtlasTrackerComponentAtlas[];
    expectComponentAtlasesToMatch(
      componentAtlases,
      [
        COMPONENT_ATLAS_WITH_ARCHIVED_LATEST_W2,
        COMPONENT_ATLAS_ARCHIVED_FOO,
        COMPONENT_ATLAS_ARCHIVED_BAR,
        COMPONENT_ATLAS_ARCHIVED_BAZ,
        COMPONENT_ATLAS_ARCHIVED_FOOFOO,
      ],
      [0, 1, 0, 0, 0]
    );
  });

  it("returns non-latest component atlases linked to the atlas", async () => {
    const res = await doComponentAtlasesRequest(
      ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlases =
      res._getJSONData() as HCAAtlasTrackerComponentAtlas[];
    expectComponentAtlasesToMatch(
      componentAtlases,
      [
        COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W2,
        COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
        COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ_W1,
      ],
      [1, 1, 0]
    );
  });
});

async function doComponentAtlasesRequest(
  atlasId: string,
  user?: TestUser,
  method = METHOD.GET,
  hideConsoleError = false,
  archived?: string
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId, archived),
  });
  await withConsoleErrorHiding(
    () => componentAtlasesHandler(req, res),
    hideConsoleError
  );
  return res;
}

function getQueryValues(
  atlasId: string,
  archived?: string
): Record<string, string> {
  return { atlasId, ...(typeof archived === "string" ? { archived } : {}) };
}

function expectComponentAtlasesToMatch(
  componentAtlases: HCAAtlasTrackerComponentAtlas[],
  expectedTestComponentAtlases: TestComponentAtlas[],
  expectedSourceDatasetCounts: number[]
): void {
  expect(componentAtlases).toHaveLength(expectedTestComponentAtlases.length);
  for (const [
    i,
    testComponentAtlas,
  ] of expectedTestComponentAtlases.entries()) {
    const componentAtlas = componentAtlases.find(
      (c) => c.id === testComponentAtlas.id
    );
    expect(componentAtlas).toBeDefined();
    if (!componentAtlas) continue;
    expectApiComponentAtlasToMatchTest(componentAtlas, testComponentAtlas);
    expect(componentAtlas.sourceDatasetCount).toEqual(
      expectedSourceDatasetCounts[i]
    );
  }
}
