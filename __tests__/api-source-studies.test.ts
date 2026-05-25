import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerGlobalSourceStudy } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import sourceStudiesHandler from "../pages/api/source-studies";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLISHED,
  ATLAS_PUBLISHED_R6,
  ATLAS_WITH_IL,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  ATLAS_WITH_MISC_SOURCE_STUDIES_C,
  ATLAS_WITH_NON_LATEST_METADATA_ENTITIES,
  ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A,
  SOURCE_STUDY_DRAFT_OK,
  SOURCE_STUDY_PUBLISHED,
  SOURCE_STUDY_PUBLISHED_WITH_HCA,
  SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A,
  SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_B,
  SOURCE_STUDY_WITH_LINKED_ENTITIES_FOO,
  SOURCE_STUDY_WITH_NON_LATEST_METADATA_ENTITIES,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  expectApiSourceStudyToHaveMatchingDbValidations,
  resetDatabase,
} from "../testing/db-utils";
import { TestAtlas, TestSourceStudy, TestUser } from "../testing/entities";
import {
  expectApiEntityToMatchLinkedAtlases,
  expectApiSourceStudyToMatchTest,
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

const TEST_ROUTE = "/api/source-studies";

const EXPECTED_PRESENT_SOURCE_STUDIES: Array<{
  atlases: TestAtlas[];
  latestAtlasIds: string[];
  sourceDatasetCount: number;
  sourceStudy: TestSourceStudy;
}> = [
  {
    atlases: [ATLAS_DRAFT],
    latestAtlasIds: [ATLAS_DRAFT.id],
    sourceDatasetCount: 2,
    sourceStudy: SOURCE_STUDY_DRAFT_OK,
  },
  {
    atlases: [ATLAS_WITH_IL, ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A],
    latestAtlasIds: [
      ATLAS_WITH_IL.id,
      ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A.id,
    ],
    sourceDatasetCount: 0,
    sourceStudy: SOURCE_STUDY_PUBLISHED_WITH_HCA,
  },
  {
    atlases: [ATLAS_WITH_MISC_SOURCE_STUDIES, ATLAS_WITH_MISC_SOURCE_STUDIES_B],
    latestAtlasIds: [
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
    ],
    sourceDatasetCount: 4,
    sourceStudy: SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A,
  },
  {
    atlases: [ATLAS_WITH_MISC_SOURCE_STUDIES],
    latestAtlasIds: [ATLAS_WITH_MISC_SOURCE_STUDIES.id],
    sourceDatasetCount: 3,
    sourceStudy: SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_B,
  },
  {
    atlases: [ATLAS_WITH_NON_LATEST_METADATA_ENTITIES],
    latestAtlasIds: [ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id],
    sourceDatasetCount: 1,
    sourceStudy: SOURCE_STUDY_WITH_NON_LATEST_METADATA_ENTITIES,
  },
  {
    atlases: [ATLAS_WITH_MISC_SOURCE_STUDIES_C],
    latestAtlasIds: [ATLAS_WITH_MISC_SOURCE_STUDIES_C.id],
    sourceDatasetCount: 2,
    sourceStudy: SOURCE_STUDY_WITH_LINKED_ENTITIES_FOO,
  },
  {
    atlases: [ATLAS_PUBLISHED_R6, ATLAS_PUBLISHED],
    latestAtlasIds: [ATLAS_PUBLISHED.id],
    sourceDatasetCount: 0,
    sourceStudy: SOURCE_STUDY_PUBLISHED,
  },
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
        await doSourceStudiesRequest(USER_CONTENT_ADMIN, METHOD.POST)
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (
        await doSourceStudiesRequest(undefined, METHOD.GET, true)
      )._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doSourceStudiesRequest(USER_UNREGISTERED, METHOD.GET, true)
      )._getStatusCode(),
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns source studies",
      TEST_ROUTE,
      sourceStudiesHandler,
      METHOD.GET,
      role,
      undefined,
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const sourceStudies =
          res._getJSONData() as HCAAtlasTrackerGlobalSourceStudy[];
        expectSourceStudiesToMatchConstantAndDb(sourceStudies);
      },
    );
  }

  it("returns source studies when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doSourceStudiesRequest(USER_CONTENT_ADMIN);
    expect(res._getStatusCode()).toEqual(200);
    const sourceStudies =
      res._getJSONData() as HCAAtlasTrackerGlobalSourceStudy[];
    expectSourceStudiesToMatchConstantAndDb(sourceStudies);
  });
});

function expectSourceStudiesToMatchConstantAndDb(
  sourceStudies: HCAAtlasTrackerGlobalSourceStudy[],
): void {
  for (const expectedInfo of EXPECTED_PRESENT_SOURCE_STUDIES) {
    const sourceStudy = expectFindSourceStudy(
      sourceStudies,
      expectedInfo.sourceStudy.id,
    );
    expectApiSourceStudyToMatchTest(sourceStudy, expectedInfo.sourceStudy);
    expect(sourceStudy.sourceDatasetCount).toEqual(
      expectedInfo.sourceDatasetCount,
    );
    expectApiEntityToMatchLinkedAtlases(
      sourceStudy,
      [],
      expectedInfo.atlases,
      expectedInfo.latestAtlasIds,
    );
    expectApiSourceStudyToHaveMatchingDbValidations(sourceStudy);
  }
}

function expectFindSourceStudy(
  sourceStudies: HCAAtlasTrackerGlobalSourceStudy[],
  sourceStudyId: string,
): HCAAtlasTrackerGlobalSourceStudy {
  const matchingSourceStudies = sourceStudies.filter(
    (s) => s.id === sourceStudyId,
  );
  expect(matchingSourceStudies).toHaveLength(1);
  return matchingSourceStudies[0];
}

async function doSourceStudiesRequest(
  user?: TestUser,
  method = METHOD.GET,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(
    () => sourceStudiesHandler(req, res),
    hideConsoleError,
  );
  return res;
}
