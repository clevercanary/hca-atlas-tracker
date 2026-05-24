import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerGlobalSourceDataset } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import sourceDatasetsHandler from "../pages/api/source-datasets";
import {
  ATLAS_PUBLISHED,
  ATLAS_PUBLISHED_R6,
  ATLAS_WITH_DRAFT_LATEST_R0,
  ATLAS_WITH_DRAFT_LATEST_R1,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  ATLAS_WITH_NON_LATEST_METADATA_ENTITIES,
  SOURCE_DATASET_BAZ,
  SOURCE_DATASET_DRAFT_LATEST_DIFFERENT_R1,
  SOURCE_DATASET_DRAFT_LATEST_DIFFERENT_R2,
  SOURCE_DATASET_DRAFT_LATEST_SAME,
  SOURCE_DATASET_FOOBAZ,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO_W1,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO_W2,
  SOURCE_DATASET_PUBLISHED,
  SOURCE_DATASET_WITH_MULTIPLE_FILES_W1,
  SOURCE_DATASET_WITH_MULTIPLE_FILES_W2,
  SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestAtlas, TestSourceDataset, TestUser } from "../testing/entities";
import {
  expectApiEntityToMatchLinkedAtlases,
  expectApiSourceDatasetToMatchTest,
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

const TEST_ROUTE = "/api/source-datasets";

const EXPECTED_PRESENT_SOURCE_DATASETS: Array<{
  atlasId: string;
  latestAtlasIds: string[];
  otherAtlases?: TestAtlas[];
  primaryAtlases: TestAtlas[];
  sourceDataset: TestSourceDataset;
}> = [
  // Latest unpublished with no older versions and single unpublished atlas version
  {
    atlasId: ATLAS_WITH_MISC_SOURCE_STUDIES.id,
    latestAtlasIds: [ATLAS_WITH_MISC_SOURCE_STUDIES.id],
    primaryAtlases: [ATLAS_WITH_MISC_SOURCE_STUDIES],
    sourceDataset: SOURCE_DATASET_BAZ,
  },
  {
    atlasId: ATLAS_WITH_MISC_SOURCE_STUDIES.id,
    latestAtlasIds: [ATLAS_WITH_MISC_SOURCE_STUDIES.id],
    primaryAtlases: [ATLAS_WITH_MISC_SOURCE_STUDIES],
    sourceDataset: SOURCE_DATASET_FOOBAZ,
  },
  // Latest unpublished with older versions and single unpublished atlas version
  {
    atlasId: ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
    latestAtlasIds: [ATLAS_WITH_MISC_SOURCE_STUDIES_B.id],
    primaryAtlases: [ATLAS_WITH_MISC_SOURCE_STUDIES_B],
    sourceDataset: SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
  },
  {
    atlasId: ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
    latestAtlasIds: [ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id],
    primaryAtlases: [ATLAS_WITH_NON_LATEST_METADATA_ENTITIES],
    sourceDataset: SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO_W2,
  },
  // Published with multiple published atlas versions
  {
    atlasId: ATLAS_PUBLISHED.id,
    latestAtlasIds: [ATLAS_PUBLISHED.id],
    primaryAtlases: [ATLAS_PUBLISHED_R6, ATLAS_PUBLISHED],
    sourceDataset: SOURCE_DATASET_PUBLISHED,
  },
  // Published and unpublished in published and unpublished versions of same atlas
  {
    atlasId: ATLAS_WITH_DRAFT_LATEST_R0.id,
    latestAtlasIds: [],
    primaryAtlases: [ATLAS_WITH_DRAFT_LATEST_R0],
    sourceDataset: SOURCE_DATASET_DRAFT_LATEST_DIFFERENT_R1,
  },
  {
    atlasId: ATLAS_WITH_DRAFT_LATEST_R1.id,
    latestAtlasIds: [ATLAS_WITH_DRAFT_LATEST_R1.id],
    primaryAtlases: [ATLAS_WITH_DRAFT_LATEST_R1],
    sourceDataset: SOURCE_DATASET_DRAFT_LATEST_DIFFERENT_R2,
  },
  // Published with published and unpublished atlas versions
  {
    atlasId: ATLAS_WITH_DRAFT_LATEST_R1.id,
    latestAtlasIds: [ATLAS_WITH_DRAFT_LATEST_R1.id],
    primaryAtlases: [ATLAS_WITH_DRAFT_LATEST_R0, ATLAS_WITH_DRAFT_LATEST_R1],
    sourceDataset: SOURCE_DATASET_DRAFT_LATEST_SAME,
  },
];

const EXPECTED_ABSENT_SOURCE_DATASETS: TestSourceDataset[] = [
  // Not linked to any atlas
  SOURCE_DATASET_WITH_MULTIPLE_FILES_W1,
  SOURCE_DATASET_WITH_MULTIPLE_FILES_W2,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO_W1,
  // Non-latest unpublished version linked to an atlas (not a case we expect to see in practice, but should be absent regardless)
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2,
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
        await doSourceDatasetsRequest(USER_CONTENT_ADMIN, METHOD.POST)
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect((await doSourceDatasetsRequest())._getStatusCode()).toEqual(401);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns source datasets",
      TEST_ROUTE,
      sourceDatasetsHandler,
      METHOD.GET,
      role,
      undefined,
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const sourceDatasets =
          res._getJSONData() as HCAAtlasTrackerGlobalSourceDataset[];
        expectSourceDatasetsToMatchConstants(sourceDatasets);
      },
    );
  }

  it("returns source datasets when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doSourceDatasetsRequest(USER_CONTENT_ADMIN);
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets =
      res._getJSONData() as HCAAtlasTrackerGlobalSourceDataset[];
    expectSourceDatasetsToMatchConstants(sourceDatasets);
  });
});

function expectSourceDatasetsToMatchConstants(
  sourceDatasets: HCAAtlasTrackerGlobalSourceDataset[],
): void {
  for (const expectedInfo of EXPECTED_PRESENT_SOURCE_DATASETS) {
    const sourceDataset = expectFindSourceDataset(
      sourceDatasets,
      expectedInfo.sourceDataset.file.id,
    );
    expectApiSourceDatasetToMatchTest(
      sourceDataset,
      expectedInfo.sourceDataset,
    );
    expectApiEntityToMatchLinkedAtlases(
      sourceDataset,
      expectedInfo.primaryAtlases,
      expectedInfo.otherAtlases ?? [],
      expectedInfo.latestAtlasIds,
      expectedInfo.atlasId,
    );
  }
  for (const expectedSourceDataset of EXPECTED_ABSENT_SOURCE_DATASETS) {
    expect(
      sourceDatasets.filter((d) => d.fileId === expectedSourceDataset.file.id),
    ).toHaveLength(0);
  }
}

function expectFindSourceDataset(
  sourceDatasets: HCAAtlasTrackerGlobalSourceDataset[],
  fileId: string,
): HCAAtlasTrackerGlobalSourceDataset {
  const matchingSourceDatasets = sourceDatasets.filter(
    (d) => d.fileId === fileId,
  );
  expect(matchingSourceDatasets).toHaveLength(1);
  return matchingSourceDatasets[0];
}

async function doSourceDatasetsRequest(
  user?: TestUser,
  method = METHOD.GET,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(
    () => sourceDatasetsHandler(req, res),
    hideConsoleError,
  );
  return res;
}
