import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerSourceDataset } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import sourceDatasetsHandler from "../pages/api/atlases/[atlasId]/source-studies/[sourceStudyId]/source-datasets";
import {
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  SOURCE_DATASET_BAR,
  SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
  SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
  SOURCE_DATASET_FOO,
  SOURCE_STUDY_WITH_SOURCE_DATASETS,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestSourceDataset, TestUser } from "../testing/entities";
import { testApiRole } from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

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
          SOURCE_STUDY_WITH_SOURCE_DATASETS.id
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
          USER_UNREGISTERED
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
        expect(sourceDatasets).toHaveLength(8);
        expectSourceDatasetsToMatch(sourceDatasets, [
          SOURCE_DATASET_FOO,
          SOURCE_DATASET_BAR,
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
    expect(sourceDatasets).toHaveLength(8);
    expectSourceDatasetsToMatch(sourceDatasets, [
      SOURCE_DATASET_FOO,
      SOURCE_DATASET_BAR,
      SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
      SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
    ]);
  });
});

async function doSourceDatasetsRequest(
  atlasId: string,
  sourceStudyId: string,
  user?: TestUser,
  method = METHOD.GET
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId, sourceStudyId),
  });
  await sourceDatasetsHandler(req, res);
  return res;
}

function getQueryValues(
  atlasId: string,
  sourceStudyId: string
): Record<string, string> {
  return { atlasId, sourceStudyId };
}

function expectSourceDatasetsToMatch(
  sourceDatasets: HCAAtlasTrackerSourceDataset[],
  expectedTestSourceDatasets: TestSourceDataset[]
): void {
  for (const testSourceDataset of expectedTestSourceDatasets) {
    const sourceDataset = sourceDatasets.find(
      (c) => c.id === testSourceDataset.id
    );
    expect(sourceDataset).toBeDefined();
    if (!sourceDataset) continue;
    expect(sourceDataset.sourceStudyId).toEqual(
      testSourceDataset.sourceStudyId
    );
    expect(sourceDataset.title).toEqual(testSourceDataset.title);
  }
}
