import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerSourceDataset } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import sourceDatasetHandler from "../pages/api/atlases/[atlasId]/component-atlases/[componentAtlasId]/source-datasets/[sourceDatasetId]";
import {
  ATLAS_DRAFT,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  COMPONENT_ATLAS_ARCHIVED_FOO,
  COMPONENT_ATLAS_DRAFT_FOO,
  COMPONENT_ATLAS_ID_WITH_MULTIPLE_FILES,
  SOURCE_DATASET_ARCHIVED_FOO,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_FOOBAZ,
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
  "/api/atlases/[atlasId]/component-atlases/[componentAtlasId]/source-datasets/[sourceDatasetId]";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for PUT request", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 405 for POST request", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 405 for DELETE request", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when source dataset is requested by logged out user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOBAZ.id,
          undefined,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when source dataset is requested by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOBAZ.id,
          USER_UNREGISTERED,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when source dataset is requested by disabled user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOBAZ.id,
          USER_DISABLED_CONTENT_ADMIN
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 404 when source dataset is requested from nonexistent atlas", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          "7021d0a6-6bc7-4429-8193-8d50ddcb65ea",
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOBAZ.id,
          USER_CONTENT_ADMIN,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns error 404 when source dataset is requested from nonexistent component atlas", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          "b885d10e-02b8-467c-9ef4-67fa59a1320e",
          SOURCE_DATASET_FOOBAZ.id,
          USER_CONTENT_ADMIN,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns error 404 when nonexistent source dataset is requested", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          "a08b7ea9-7ba4-413b-a0f5-73ad26f6d630",
          USER_CONTENT_ADMIN,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns source dataset",
      TEST_ROUTE,
      sourceDatasetHandler,
      METHOD.GET,
      role,
      getQueryValues(
        ATLAS_DRAFT.id,
        COMPONENT_ATLAS_DRAFT_FOO.id,
        SOURCE_DATASET_FOOBAZ.id
      ),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const sourceDataset =
          res._getJSONData() as HCAAtlasTrackerSourceDataset;
        expectApiSourceDatasetsToMatchTest(
          [sourceDataset],
          [SOURCE_DATASET_FOOBAZ]
        );
      }
    );
  }

  it("returns source dataset when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_FOO.id,
      SOURCE_DATASET_FOOBAZ.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset = res._getJSONData() as HCAAtlasTrackerSourceDataset;
    expectApiSourceDatasetsToMatchTest(
      [sourceDataset],
      [SOURCE_DATASET_FOOBAZ]
    );
  });

  it("returns archived source dataset", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      COMPONENT_ATLAS_ID_WITH_MULTIPLE_FILES,
      SOURCE_DATASET_ARCHIVED_FOO.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset = res._getJSONData() as HCAAtlasTrackerSourceDataset;
    expectApiSourceDatasetsToMatchTest(
      [sourceDataset],
      [SOURCE_DATASET_ARCHIVED_FOO]
    );
  });

  it("returns source dataset when requested from archived component atlas", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      COMPONENT_ATLAS_ARCHIVED_FOO.id,
      SOURCE_DATASET_WITH_MULTIPLE_FILES.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset = res._getJSONData() as HCAAtlasTrackerSourceDataset;
    expectApiSourceDatasetsToMatchTest(
      [sourceDataset],
      [SOURCE_DATASET_WITH_MULTIPLE_FILES]
    );
  });
});

async function doSourceDatasetRequest(
  atlasId: string,
  componentAtlasId: string,
  sourceDatasetId: string,
  user?: TestUser,
  method = METHOD.GET,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId, componentAtlasId, sourceDatasetId),
  });
  await withConsoleErrorHiding(
    () => sourceDatasetHandler(req, res),
    hideConsoleError
  );
  return res;
}

function getQueryValues(
  atlasId: string,
  componentAtlasId: string,
  sourceDatasetId: string
): Record<string, string> {
  return { atlasId, componentAtlasId, sourceDatasetId };
}
