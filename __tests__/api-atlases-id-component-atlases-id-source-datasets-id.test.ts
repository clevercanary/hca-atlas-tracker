import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import sourceDatasetHandler from "../pages/api/atlases/[atlasId]/component-atlases/[componentAtlasId]/source-datasets/[sourceDatasetId]";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  COMPONENT_ATLAS_DRAFT_FOO,
  FILE_COMPONENT_ATLAS_DRAFT_BAR,
  FILE_COMPONENT_ATLAS_DRAFT_FOO,
  SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_FOOBAZ,
  SOURCE_DATASET_FOOFOO,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  getComponentAtlasFromDatabase,
  resetDatabase,
} from "../testing/db-utils";
import { TestComponentAtlas, TestUser } from "../testing/entities";
import { testApiRole, withConsoleErrorHiding } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

const TEST_ROUTE =
  "/api/atlases/[atlasId]/component-atlases/[componentAtlasId]/source-datasets/[sourceDatasetId]";

const SOURCE_DATASET_ID_NONEXISTENT = "52281fde-232c-4481-8b45-cc986570e7b9";

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
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          undefined,
          METHOD.PUT
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when source dataset is requested by logged out user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
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
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
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
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOBAZ.id,
          USER_DISABLED_CONTENT_ADMIN
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  // TODO: test for successful GET once datasets are available again

  it("returns error 401 when POST requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          undefined,
          METHOD.POST,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when POST requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          USER_UNREGISTERED,
          METHOD.POST,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when POST requested from draft atlas by disabled user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      sourceDatasetHandler,
      METHOD.POST,
      role,
      getQueryValues(
        ATLAS_DRAFT.id,
        FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
        SOURCE_DATASET_FOO.id
      ),
      undefined,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
      }
    );
  }

  it("returns error 403 when POST requested from draft atlas by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 404 when POST requested from atlas the component atlas doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_PUBLIC.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  // TODO: test component atlas that already has the source dataset once available

  it("returns error 400 when POST requested with nonexistent source dataset", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_ID_NONEXISTENT,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  // TODO: test for successful requests once the component_atlases table is used again

  it("returns error 400 when POST requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_DRAFT.id,
      FILE_COMPONENT_ATLAS_DRAFT_BAR.id,
      SOURCE_DATASET_FOO.id,
      USER_INTEGRATION_LEAD_DRAFT,
      METHOD.POST,
      true
    );
    expect(res._getStatusCode()).toEqual(400);
  });

  it("returns error 400 when POST requested by user with CONTENT_ADMIN role", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_DRAFT.id,
      FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
      SOURCE_DATASET_FOO.id,
      USER_CONTENT_ADMIN,
      METHOD.POST,
      true
    );
    expect(res._getStatusCode()).toEqual(400);
  });

  it("returns error 401 when DELETE requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOFOO.id,
          undefined,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when DELETE requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOFOO.id,
          USER_UNREGISTERED,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when DELETE requested from draft atlas by disabled user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOFOO.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      sourceDatasetHandler,
      METHOD.DELETE,
      role,
      getQueryValues(
        ATLAS_DRAFT.id,
        FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
        SOURCE_DATASET_FOOFOO.id
      ),
      undefined,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
      }
    );
  }

  it("returns error 403 when DELETE requested from draft atlas by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOFOO.id,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 404 when DELETE requested from atlas the component atlas doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_PUBLIC.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOFOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 when DELETE requested with nonexistent source dataset", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_ID_NONEXISTENT,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  // TODO: test for when DELETE requested from component atlas the source dataset doesn't exist on once datasets are available again

  // TODO: test for successful requests once the component_atlases table is used again

  it("returns error 400 when requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_BAR.id,
          SOURCE_DATASET_CELLXGENE_WITH_UPDATE.id,
          USER_INTEGRATION_LEAD_DRAFT,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when requested by user with CONTENT_ADMIN role", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOFOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
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

async function expectComponentAtlasToBeUnchanged(
  componentAtlas: TestComponentAtlas
): Promise<void> {
  const componentAtlasFromDb = await getComponentAtlasFromDatabase(
    componentAtlas.id
  );
  expect(componentAtlasFromDb).toBeDefined();
  if (!componentAtlasFromDb) return;
  expect(componentAtlasFromDb.atlas_id).toEqual(componentAtlas.atlasId);
  expect(componentAtlasFromDb.title).toEqual(componentAtlas.title);
}
