import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerGlobalComponentAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import componentAtlasesHandler from "../pages/api/component-atlases";
import {
  ATLAS_PUBLISHED,
  ATLAS_PUBLISHED_R6,
  ATLAS_WITH_DRAFT_LATEST_R0,
  ATLAS_WITH_DRAFT_LATEST_R1,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  ATLAS_WITH_NON_LATEST_METADATA_ENTITIES,
  COMPONENT_ATLAS_DRAFT_LATEST_DIFFERENT_R1,
  COMPONENT_ATLAS_DRAFT_LATEST_DIFFERENT_R2,
  COMPONENT_ATLAS_DRAFT_LATEST_SAME,
  COMPONENT_ATLAS_MISC_BAR,
  COMPONENT_ATLAS_MISC_BAZ,
  COMPONENT_ATLAS_MISC_FOO,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ_W1,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W1,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W2,
  COMPONENT_ATLAS_PUBLISHED,
  COMPONENT_ATLAS_WITH_ARCHIVED_LATEST_W2,
  COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W1,
  COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W2,
  COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestAtlas, TestComponentAtlas, TestUser } from "../testing/entities";
import {
  expectApiComponentAtlasToMatchTest,
  expectApiEntityToMatchLinkedAtlases,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

const TEST_ROUTE = "/api/component-atlases";

const EXPECTED_PRESENT_COMPONENT_ATLASES: Array<{
  atlasId: string;
  componentAtlas: TestComponentAtlas;
  latestAtlasIds: string[];
  otherAtlases?: TestAtlas[];
  primaryAtlases: TestAtlas[];
}> = [
  // Latest unpublished with no older versions and single unpublished atlas version
  {
    atlasId: ATLAS_WITH_MISC_SOURCE_STUDIES.id,
    componentAtlas: COMPONENT_ATLAS_MISC_FOO,
    latestAtlasIds: [ATLAS_WITH_MISC_SOURCE_STUDIES.id],
    primaryAtlases: [ATLAS_WITH_MISC_SOURCE_STUDIES],
  },
  {
    atlasId: ATLAS_WITH_MISC_SOURCE_STUDIES.id,
    componentAtlas: COMPONENT_ATLAS_MISC_BAR,
    latestAtlasIds: [ATLAS_WITH_MISC_SOURCE_STUDIES.id],
    primaryAtlases: [ATLAS_WITH_MISC_SOURCE_STUDIES],
  },
  {
    atlasId: ATLAS_WITH_MISC_SOURCE_STUDIES.id,
    componentAtlas: COMPONENT_ATLAS_MISC_BAZ,
    latestAtlasIds: [ATLAS_WITH_MISC_SOURCE_STUDIES.id],
    primaryAtlases: [ATLAS_WITH_MISC_SOURCE_STUDIES],
  },
  // Latest unpublished with older versions and single unpublished atlas version
  {
    atlasId: ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
    componentAtlas: COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3,
    latestAtlasIds: [ATLAS_WITH_MISC_SOURCE_STUDIES_B.id],
    primaryAtlases: [ATLAS_WITH_MISC_SOURCE_STUDIES_B],
  },
  {
    atlasId: ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
    componentAtlas: COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
    latestAtlasIds: [ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id],
    primaryAtlases: [ATLAS_WITH_NON_LATEST_METADATA_ENTITIES],
  },
  // Published with multiple published atlas versions
  {
    atlasId: ATLAS_PUBLISHED.id,
    componentAtlas: COMPONENT_ATLAS_PUBLISHED,
    latestAtlasIds: [ATLAS_PUBLISHED.id],
    primaryAtlases: [ATLAS_PUBLISHED_R6, ATLAS_PUBLISHED],
  },
  // Published and unpublished in published and unpublished versions of same atlas
  {
    atlasId: ATLAS_WITH_DRAFT_LATEST_R0.id,
    componentAtlas: COMPONENT_ATLAS_DRAFT_LATEST_DIFFERENT_R1,
    latestAtlasIds: [],
    primaryAtlases: [ATLAS_WITH_DRAFT_LATEST_R0],
  },
  {
    atlasId: ATLAS_WITH_DRAFT_LATEST_R1.id,
    componentAtlas: COMPONENT_ATLAS_DRAFT_LATEST_DIFFERENT_R2,
    latestAtlasIds: [ATLAS_WITH_DRAFT_LATEST_R1.id],
    primaryAtlases: [ATLAS_WITH_DRAFT_LATEST_R1],
  },
  // Published with published and unpublished atlas versions
  {
    atlasId: ATLAS_WITH_DRAFT_LATEST_R1.id,
    componentAtlas: COMPONENT_ATLAS_DRAFT_LATEST_SAME,
    latestAtlasIds: [ATLAS_WITH_DRAFT_LATEST_R1.id],
    primaryAtlases: [ATLAS_WITH_DRAFT_LATEST_R0, ATLAS_WITH_DRAFT_LATEST_R1],
  },
];

const EXPECTED_ABSENT_COMPONENT_ATLASES: TestComponentAtlas[] = [
  // Not linked to any atlas
  COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W1,
  COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W2,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W1,
  // Non-latest unpublished version linked to an atlas (not a case we expect to see in practice, but should be absent regardless)
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W2,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ_W1,
  // Archived latest version linked to atlas
  COMPONENT_ATLAS_WITH_ARCHIVED_LATEST_W2,
];

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
        await doComponentAtlasesRequest(USER_CONTENT_ADMIN, METHOD.POST)
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (
        await doComponentAtlasesRequest(undefined, METHOD.GET, true)
      )._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doComponentAtlasesRequest(USER_UNREGISTERED, METHOD.GET, true)
      )._getStatusCode(),
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns component atlases",
      TEST_ROUTE,
      componentAtlasesHandler,
      METHOD.GET,
      role,
      undefined,
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const componentAtlases =
          res._getJSONData() as HCAAtlasTrackerGlobalComponentAtlas[];
        expectComponentAtlasesToMatchConstants(componentAtlases);
      },
    );
  }

  it("returns component atlases when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doComponentAtlasesRequest(USER_CONTENT_ADMIN);
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlases =
      res._getJSONData() as HCAAtlasTrackerGlobalComponentAtlas[];
    expectComponentAtlasesToMatchConstants(componentAtlases);
  });
});

function expectComponentAtlasesToMatchConstants(
  componentAtlases: HCAAtlasTrackerGlobalComponentAtlas[],
): void {
  for (const expectedInfo of EXPECTED_PRESENT_COMPONENT_ATLASES) {
    const componentAtlas = expectFindComponentAtlas(
      componentAtlases,
      expectedInfo.componentAtlas.file.id,
    );
    expectApiComponentAtlasToMatchTest(
      componentAtlas,
      expectedInfo.componentAtlas,
    );
    expectApiEntityToMatchLinkedAtlases(
      componentAtlas,
      expectedInfo.primaryAtlases,
      expectedInfo.otherAtlases ?? [],
      expectedInfo.latestAtlasIds,
      expectedInfo.atlasId,
    );
  }
  for (const expectedComponentAtlas of EXPECTED_ABSENT_COMPONENT_ATLASES) {
    expect(
      componentAtlases.filter(
        (c) => c.fileId === expectedComponentAtlas.file.id,
      ),
    ).toHaveLength(0);
  }
}

function expectFindComponentAtlas(
  componentAtlases: HCAAtlasTrackerGlobalComponentAtlas[],
  fileId: string,
): HCAAtlasTrackerGlobalComponentAtlas {
  const matchingComponentAtlases = componentAtlases.filter(
    (c) => c.fileId === fileId,
  );
  expect(matchingComponentAtlases).toHaveLength(1);
  return matchingComponentAtlases[0];
}

async function doComponentAtlasesRequest(
  user?: TestUser,
  method = METHOD.GET,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(
    () => componentAtlasesHandler(req, res),
    hideConsoleError,
  );
  return res;
}
