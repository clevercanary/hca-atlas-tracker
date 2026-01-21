import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerSourceDataset } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import sourceDatasetsHandler from "../pages/api/atlases/[atlasId]/source-datasets";
import {
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES,
  SOURCE_DATASET_ARCHIVED_BAR,
  SOURCE_DATASET_ARCHIVED_BAZ,
  SOURCE_DATASET_ARCHIVED_FOO,
  SOURCE_DATASET_ARCHIVED_FOOBAR,
  SOURCE_DATASET_ARCHIVED_FOOFOO,
  SOURCE_DATASET_ATLAS_LINKED_A_BAR,
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  SOURCE_DATASET_ATLAS_LINKED_B_BAR,
  SOURCE_DATASET_ATLAS_LINKED_B_FOO,
  SOURCE_DATASET_BAR,
  SOURCE_DATASET_BAZ,
  SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
  SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_FOOBAR,
  SOURCE_DATASET_FOOBAZ,
  SOURCE_DATASET_FOOFOO,
  SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO,
  SOURCE_DATASET_WITH_ARCHIVED_LATEST,
  SOURCE_DATASET_WITH_MULTIPLE_FILES,
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

const TEST_ROUTE = "/api/atlases/[id]/source-datasets";

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
          USER_DISABLED_CONTENT_ADMIN
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 400 when `archived` parameter is set to an invalid value", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          USER_CONTENT_ADMIN,
          undefined,
          undefined,
          "invalid-value"
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns source datasets",
      TEST_ROUTE,
      sourceDatasetsHandler,
      METHOD.GET,
      role,
      getQueryValues(ATLAS_WITH_MISC_SOURCE_STUDIES.id),
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
          SOURCE_DATASET_ATLAS_LINKED_A_FOO,
          SOURCE_DATASET_ATLAS_LINKED_A_BAR,
          SOURCE_DATASET_ATLAS_LINKED_B_FOO,
          SOURCE_DATASET_ATLAS_LINKED_B_BAR,
          SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO,
        ]);
      }
    );
  }

  it("returns source datasets when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
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
      SOURCE_DATASET_ATLAS_LINKED_A_FOO,
      SOURCE_DATASET_ATLAS_LINKED_A_BAR,
      SOURCE_DATASET_ATLAS_LINKED_B_FOO,
      SOURCE_DATASET_ATLAS_LINKED_B_BAR,
      SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO,
    ]);
  });

  it("returns source datasets only for latest file versions and only if they're non-archived", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets = res._getJSONData() as HCAAtlasTrackerSourceDataset[];
    expectApiSourceDatasetsToMatchTest(sourceDatasets, [
      SOURCE_DATASET_WITH_MULTIPLE_FILES,
    ]);
    const sourceDataset = sourceDatasets[0];
    if (!expectIsDefined(sourceDataset)) return;
    expect(sourceDataset.sizeBytes).toEqual(
      Number(FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES.sizeBytes)
    );
  });

  it("returns only non-archived source datasets when `archived` parameter is explicitly set to `false`", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      USER_CONTENT_ADMIN,
      undefined,
      undefined,
      "false"
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets = res._getJSONData() as HCAAtlasTrackerSourceDataset[];
    expectApiSourceDatasetsToMatchTest(sourceDatasets, [
      SOURCE_DATASET_WITH_MULTIPLE_FILES,
    ]);
  });

  it("returns only archived source datasets when `archived` parameter is set to `true`", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      USER_CONTENT_ADMIN,
      undefined,
      undefined,
      "true"
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets = res._getJSONData() as HCAAtlasTrackerSourceDataset[];
    expectApiSourceDatasetsToMatchTest(sourceDatasets, [
      SOURCE_DATASET_WITH_ARCHIVED_LATEST,
      SOURCE_DATASET_ARCHIVED_FOO,
      SOURCE_DATASET_ARCHIVED_BAR,
      SOURCE_DATASET_ARCHIVED_BAZ,
      SOURCE_DATASET_ARCHIVED_FOOFOO,
      SOURCE_DATASET_ARCHIVED_FOOBAR,
    ]);
  });
});

async function doSourceDatasetsRequest(
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
    () => sourceDatasetsHandler(req, res),
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
