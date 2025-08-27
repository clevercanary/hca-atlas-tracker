import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerComponentAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { createComponentAtlas } from "../app/services/component-atlases";
import { endPgPool } from "../app/services/database";
import componentAtlasesHandler from "../pages/api/atlases/[atlasId]/component-atlases";
import {
  ATLAS_DRAFT,
  COMPONENT_ATLAS_DRAFT_BAR,
  COMPONENT_ATLAS_DRAFT_FOO,
  FILE_COMPONENT_ATLAS_DRAFT_BAR,
  FILE_COMPONENT_ATLAS_DRAFT_FOO,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestComponentAtlas, TestFile, TestUser } from "../testing/entities";
import {
  expectApiComponentAtlasToMatchTest,
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
        expect(componentAtlases).toHaveLength(2);
        expectComponentAtlasesToMatch(
          componentAtlases,
          [FILE_COMPONENT_ATLAS_DRAFT_FOO, FILE_COMPONENT_ATLAS_DRAFT_BAR],
          [COMPONENT_ATLAS_DRAFT_FOO, COMPONENT_ATLAS_DRAFT_BAR]
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
    expect(componentAtlases).toHaveLength(2);
    expectComponentAtlasesToMatch(
      componentAtlases,
      [FILE_COMPONENT_ATLAS_DRAFT_FOO, FILE_COMPONENT_ATLAS_DRAFT_BAR],
      [COMPONENT_ATLAS_DRAFT_FOO, COMPONENT_ATLAS_DRAFT_BAR]
    );
  });
});

describe("createComponentAtlas", () => {
  const TEST_COMPONENT_ATLAS_TITLE = "Test Component Atlas";

  it("creates a new component atlas successfully", async () => {
    const testComponentInfo = {
      assay: ["RNA sequencing"],
      cellCount: 1000,
      disease: ["normal"],
      suspensionType: ["cell"],
      tissue: ["brain"],
    };

    const result = await createComponentAtlas(
      ATLAS_DRAFT.id,
      TEST_COMPONENT_ATLAS_TITLE,
      testComponentInfo
    );

    expect(result).toBeDefined();
    expect(result.atlas_id).toBe(ATLAS_DRAFT.id);
    expect(result.title).toBe(TEST_COMPONENT_ATLAS_TITLE);
    expect(result.component_info).toEqual(testComponentInfo);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeDefined();
    expect(result.updated_at).toBeDefined();
  });

  it("throws error when creating component atlas for non-existent atlas", async () => {
    const testComponentInfo = {
      assay: ["RNA sequencing"],
      cellCount: 500,
      disease: ["normal"],
      suspensionType: ["cell"],
      tissue: ["liver"],
    };

    await expect(
      createComponentAtlas(
        "non-existent-atlas-id",
        TEST_COMPONENT_ATLAS_TITLE,
        testComponentInfo
      )
    ).rejects.toThrow();
  });

  it("creates component atlas with empty component info", async () => {
    const emptyComponentInfo = {};

    const result = await createComponentAtlas(
      ATLAS_DRAFT.id,
      "Empty Component Atlas",
      emptyComponentInfo
    );

    expect(result).toBeDefined();
    expect(result.atlas_id).toBe(ATLAS_DRAFT.id);
    expect(result.title).toBe("Empty Component Atlas");
    expect(result.component_info).toEqual(emptyComponentInfo);
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
  expectedTestFiles: TestFile[],
  expectedTestComponentAtlases: TestComponentAtlas[]
): void {
  for (const [i, testFile] of expectedTestFiles.entries()) {
    const testComponentAtlas = expectedTestComponentAtlases[i];
    const componentAtlas = componentAtlases.find((c) => c.id === testFile.id);
    expect(componentAtlas).toBeDefined();
    if (!componentAtlas) continue;
    expectApiComponentAtlasToMatchTest(
      componentAtlas,
      testFile,
      testComponentAtlas
    );
  }
}
