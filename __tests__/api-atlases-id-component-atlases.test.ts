import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerDBComponentAtlasInfo,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import {
  createComponentAtlas,
  resetComponentAtlasInfo,
} from "../app/services/component-atlases";
import { endPgPool } from "../app/services/database";
import componentAtlasesHandler from "../pages/api/atlases/[atlasId]/component-atlases";
import {
  ATLAS_DRAFT,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  COMPONENT_ATLAS_DRAFT_BAR,
  COMPONENT_ATLAS_DRAFT_FOO,
  COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
  FILE_C_COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  createTestComponentAtlas,
  getExistingComponentAtlasFromDatabase,
  resetDatabase,
} from "../testing/db-utils";
import { TestComponentAtlas, TestUser } from "../testing/entities";
import {
  expectApiComponentAtlasToMatchTest,
  expectIsDefined,
  getLatestFileForTestEntity,
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
        expectComponentAtlasesToMatch(componentAtlases, [
          COMPONENT_ATLAS_DRAFT_FOO,
          COMPONENT_ATLAS_DRAFT_BAR,
        ]);
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
    expectComponentAtlasesToMatch(componentAtlases, [
      COMPONENT_ATLAS_DRAFT_FOO,
      COMPONENT_ATLAS_DRAFT_BAR,
    ]);
  });

  it("returns component atlas for latest file version only", async () => {
    const res = await doComponentAtlasesRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlases =
      res._getJSONData() as HCAAtlasTrackerComponentAtlas[];
    expectComponentAtlasesToMatch(componentAtlases, [
      COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
    ]);
    const componentAtlas = componentAtlases[0];
    if (!expectIsDefined(componentAtlas)) return;
    expect(componentAtlas.sizeBytes).toEqual(
      Number(FILE_C_COMPONENT_ATLAS_WITH_MULTIPLE_FILES.sizeBytes)
    );
  });
});

const EMPTY_COMPONENT_INFO = {
  assay: [],
  cellCount: 0,
  cellxgeneDatasetId: null,
  cellxgeneDatasetVersion: null,
  description: "",
  disease: [],
  suspensionType: [],
  tissue: [],
};

describe("createComponentAtlas", () => {
  const TEST_COMPONENT_ATLAS_TITLE = "Test Component Atlas";

  it("throws error when creating component atlas for non-existent atlas", async () => {
    await expect(
      createComponentAtlas("non-existent-atlas-id", TEST_COMPONENT_ATLAS_TITLE)
    ).rejects.toThrow();
  });

  it("creates component atlas with empty values in component info", async () => {
    const result = await createComponentAtlas(
      ATLAS_DRAFT.id,
      "Empty Component Atlas"
    );

    expect(result).toBeDefined();
    expect(result.atlas_id).toBe(ATLAS_DRAFT.id);
    expect(result.title).toBe("Empty Component Atlas");
    expect(result.component_info).toEqual(EMPTY_COMPONENT_INFO);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeDefined();
    expect(result.updated_at).toBeDefined();
  });
});

describe("resetComponentAtlasInfo", () => {
  const TEST_COMPONENT_INFO: HCAAtlasTrackerDBComponentAtlasInfo = {
    assay: ["RNA sequencing"],
    cellCount: 1000,
    cellxgeneDatasetId: null,
    cellxgeneDatasetVersion: null,
    description: "",
    disease: ["normal"],
    suspensionType: ["cell"],
    tissue: ["brain"],
  };

  it("updates component atlas metadata successfully", async () => {
    // First create a component atlas
    const initialComponentInfo = TEST_COMPONENT_INFO;

    const createdAtlas = await createTestComponentAtlas(
      ATLAS_DRAFT.id,
      "Test Update Atlas",
      initialComponentInfo
    );

    // Then update it to reset metadata (empty values for S3 notification workflow)

    // Add a small delay to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 10));
    await resetComponentAtlasInfo(createdAtlas.id);
    const updatedAtlas = await getExistingComponentAtlasFromDatabase(
      createdAtlas.id
    );

    expect(updatedAtlas).toBeDefined();
    expect(updatedAtlas.id).toBe(createdAtlas.id);
    expect(updatedAtlas.component_info).toEqual(EMPTY_COMPONENT_INFO);
    expect(new Date(updatedAtlas.updated_at).getTime()).toBeGreaterThan(
      new Date(createdAtlas.updated_at).getTime()
    );
  });

  it("throws error when updating non-existent component atlas", async () => {
    const nonexistentId = "f24386f9-bc72-48ce-8f91-2992b17df164";
    await expect(resetComponentAtlasInfo(nonexistentId)).rejects.toThrow();
  });
});

async function doComponentAtlasesRequest(
  atlasId: string,
  user?: TestUser,
  method = METHOD.GET,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId),
  });
  await withConsoleErrorHiding(
    () => componentAtlasesHandler(req, res),
    hideConsoleError
  );
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}

function expectComponentAtlasesToMatch(
  componentAtlases: HCAAtlasTrackerComponentAtlas[],
  expectedTestComponentAtlases: TestComponentAtlas[]
): void {
  expect(componentAtlases).toHaveLength(expectedTestComponentAtlases.length);
  for (const testComponentAtlas of expectedTestComponentAtlases) {
    const fileId = getLatestFileForTestEntity(testComponentAtlas).id;
    const componentAtlas = componentAtlases.find((c) => c.id === fileId);
    expect(componentAtlas).toBeDefined();
    if (!componentAtlas) continue;
    expectApiComponentAtlasToMatchTest(componentAtlas, testComponentAtlas);
  }
}
