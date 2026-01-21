import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerSourceDataset } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import sourceDatasetsHandler from "../pages/api/atlases/[atlasId]/source-studies/[sourceStudyId]/source-datasets";
import {
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES,
  SOURCE_DATASET_BAR,
  SOURCE_DATASET_BAZ,
  SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
  SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_FOOBAR,
  SOURCE_DATASET_FOOBAZ,
  SOURCE_DATASET_FOOFOO,
  SOURCE_DATASET_WITH_MULTIPLE_FILES,
  SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A,
  SOURCE_STUDY_WITH_SOURCE_DATASETS,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import {
  expectApiSourceDatasetsToMatchTest,
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

const TEST_ROUTE =
  "/api/atlases/[id]/source-studies/[sourceStudyId]/source-datasets";

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
        await doSourceDatasetsRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          undefined,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when source datasets are requested by logged out user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          undefined,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when source datasets are requested by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          USER_UNREGISTERED,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when source datasets are requested by disabled user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
          USER_DISABLED_CONTENT_ADMIN
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns source datasets",
      TEST_ROUTE,
      sourceDatasetsHandler,
      METHOD.GET,
      role,
      getQueryValues(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
        SOURCE_STUDY_WITH_SOURCE_DATASETS.id
      ),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const sourceDatasets =
          res._getJSONData() as HCAAtlasTrackerSourceDataset[];
        expectApiSourceDatasetsToMatchTest(sourceDatasets, [
          SOURCE_DATASET_FOO,
          SOURCE_DATASET_BAR,
          SOURCE_DATASET_BAZ,
          SOURCE_DATASET_FOOFOO,
          SOURCE_DATASET_FOOBAR,
          SOURCE_DATASET_FOOBAZ,
          SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
          SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
        ]);
      }
    );
  }

  it("returns source datasets when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets = res._getJSONData() as HCAAtlasTrackerSourceDataset[];
    expectApiSourceDatasetsToMatchTest(sourceDatasets, [
      SOURCE_DATASET_FOO,
      SOURCE_DATASET_BAR,
      SOURCE_DATASET_BAZ,
      SOURCE_DATASET_FOOFOO,
      SOURCE_DATASET_FOOBAR,
      SOURCE_DATASET_FOOBAZ,
      SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
      SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
    ]);
  });

  it("returns source datasets only for latest file versions that are non-archived and linked to the requested atlas", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets = res._getJSONData() as HCAAtlasTrackerSourceDataset[];
    expectApiSourceDatasetsToMatchTest(sourceDatasets, [
      SOURCE_DATASET_WITH_MULTIPLE_FILES,
    ]);
    const datasetWithMultipleFiles = sourceDatasets.find(
      (d) => d.id === SOURCE_DATASET_WITH_MULTIPLE_FILES.id
    );
    if (!expectIsDefined(datasetWithMultipleFiles)) return;
    expect(datasetWithMultipleFiles.sizeBytes).toEqual(
      Number(FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES.sizeBytes)
    );
  });
});

async function doSourceDatasetsRequest(
  atlasId: string,
  sourceStudyId: string,
  user?: TestUser,
  method = METHOD.GET,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId, sourceStudyId),
  });
  await withConsoleErrorHiding(
    () => sourceDatasetsHandler(req, res),
    hideConsoleError
  );
  return res;
}

function getQueryValues(
  atlasId: string,
  sourceStudyId: string
): Record<string, string> {
  return { atlasId, sourceStudyId };
}
