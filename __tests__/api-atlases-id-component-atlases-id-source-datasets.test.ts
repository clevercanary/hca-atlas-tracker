import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  ComponentAtlasAddSourceDatasetsData,
  ComponentAtlasDeleteSourceDatasetsData,
} from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import sourceDatasetsHandler from "../pages/api/atlases/[atlasId]/component-atlases/[componentAtlasId]/source-datasets";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  COMPONENT_ATLAS_DRAFT_FOO,
  FILE_COMPONENT_ATLAS_DRAFT_BAR,
  FILE_COMPONENT_ATLAS_DRAFT_FOO,
  SOURCE_DATASET_BAR,
  SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_FOOBAR,
  SOURCE_DATASET_FOOFOO,
  STAKEHOLDER_ANALOGOUS_ROLES,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
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
  "/api/atlases/[atlasId]/component-atlases/[componentAtlasId]/source-datasets";

const SOURCE_DATASET_ID_NONEXISTENT = "52281fde-232c-4481-8b45-cc986570e7b9";

const NEW_DATASETS_DATA: ComponentAtlasAddSourceDatasetsData = {
  sourceDatasetIds: [SOURCE_DATASET_FOO.id, SOURCE_DATASET_BAR.id],
};

const NEW_DATASETS_WITH_EXISTING_DATA: ComponentAtlasAddSourceDatasetsData = {
  sourceDatasetIds: [SOURCE_DATASET_FOOFOO.id, SOURCE_DATASET_BAR.id],
};

const NEW_DATASETS_WITH_NONEXISTENT_DATA: ComponentAtlasAddSourceDatasetsData =
  {
    sourceDatasetIds: [SOURCE_DATASET_FOO.id, SOURCE_DATASET_ID_NONEXISTENT],
  };

const DELETE_DATASETS_DATA: ComponentAtlasDeleteSourceDatasetsData = {
  sourceDatasetIds: [SOURCE_DATASET_FOOFOO.id, SOURCE_DATASET_FOOBAR.id],
};

const DELETE_DATASETS_WITH_MISSING_DATA: ComponentAtlasDeleteSourceDatasetsData =
  {
    sourceDatasetIds: [SOURCE_DATASET_FOO.id, SOURCE_DATASET_FOOBAR.id],
  };

const DELETE_DATASETS_WITH_NONEXISTENT_DATA: ComponentAtlasDeleteSourceDatasetsData =
  {
    sourceDatasetIds: [SOURCE_DATASET_FOO.id, SOURCE_DATASET_ID_NONEXISTENT],
  };

const DELETE_DRAFT_BAR_DATASETS_DATA: ComponentAtlasDeleteSourceDatasetsData = {
  sourceDatasetIds: [SOURCE_DATASET_CELLXGENE_WITH_UPDATE.id],
};

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
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          undefined,
          METHOD.PUT
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when source datasets are requested by logged out user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          undefined,
          METHOD.GET,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when source datasets are requested by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_UNREGISTERED,
          METHOD.GET,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when source datasets are requested by disabled user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_DISABLED_CONTENT_ADMIN
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  // TODO: test for both fully-ingested and file-only component atlases once the former exists

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns empty source datasets",
      TEST_ROUTE,
      sourceDatasetsHandler,
      METHOD.GET,
      role,
      getQueryValues(ATLAS_DRAFT.id, FILE_COMPONENT_ATLAS_DRAFT_FOO.id),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const sourceDatasets =
          res._getJSONData() as HCAAtlasTrackerSourceDataset[];
        expect(sourceDatasets).toEqual([]);
      }
    );
  }

  it("returns empty source datasets when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_DRAFT.id,
      FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDatasets = res._getJSONData() as HCAAtlasTrackerSourceDataset[];
    expect(sourceDatasets).toEqual([]);
  });

  it("returns error 401 when POST requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          undefined,
          METHOD.POST,
          NEW_DATASETS_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when POST requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_UNREGISTERED,
          METHOD.POST,
          NEW_DATASETS_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when POST requested from draft atlas by disabled user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.POST,
          NEW_DATASETS_DATA
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      sourceDatasetsHandler,
      METHOD.POST,
      role,
      getQueryValues(ATLAS_DRAFT.id, FILE_COMPONENT_ATLAS_DRAFT_FOO.id),
      NEW_DATASETS_DATA,
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
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.POST,
          NEW_DATASETS_DATA
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 404 when POST requested from atlas the component atlas doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_PUBLIC.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          NEW_DATASETS_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 when POST requested from component atlas that already has one of the source datasets", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          NEW_DATASETS_WITH_EXISTING_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 for POST requested where one of the source datasets doesn't exist", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          NEW_DATASETS_WITH_NONEXISTENT_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  // TODO: test for successful requests once the component_atlases table is used again

  it("returns error 400 when POST requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_DRAFT.id,
      FILE_COMPONENT_ATLAS_DRAFT_BAR.id,
      USER_INTEGRATION_LEAD_DRAFT,
      METHOD.POST,
      NEW_DATASETS_DATA,
      true
    );
    expect(res._getStatusCode()).toEqual(400);
  });

  it("returns error 400 when POST requested by user with CONTENT_ADMIN role", async () => {
    const res = await doSourceDatasetsRequest(
      ATLAS_DRAFT.id,
      FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
      USER_CONTENT_ADMIN,
      METHOD.POST,
      NEW_DATASETS_DATA,
      true
    );
    expect(res._getStatusCode()).toEqual(400);
  });

  it("returns error 401 when DELETE requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          undefined,
          METHOD.DELETE,
          DELETE_DATASETS_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when DELETE requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_UNREGISTERED,
          METHOD.DELETE,
          DELETE_DATASETS_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when DELETE requested from draft atlas by disabled user", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_DATA
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      sourceDatasetsHandler,
      METHOD.DELETE,
      role,
      getQueryValues(ATLAS_DRAFT.id, FILE_COMPONENT_ATLAS_DRAFT_FOO.id),
      DELETE_DATASETS_DATA,
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
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.DELETE,
          DELETE_DATASETS_DATA
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 404 when DELETE requested from atlas the component atlas doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_PUBLIC.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 when DELETE requested from component atlas that one of the source datasets doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_WITH_MISSING_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 for DELETE request where one of the source datasets doesn't exist", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_WITH_NONEXISTENT_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  // TODO: test for successful requests once the component_atlases table is used again

  it("returns error 400 when requested by user with INTERGRATION_LEAD role for the atlas", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_BAR.id,
          USER_INTEGRATION_LEAD_DRAFT,
          METHOD.DELETE,
          DELETE_DRAFT_BAR_DATASETS_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when requested by user with CONTENT_ADMIN role", async () => {
    expect(
      (
        await doSourceDatasetsRequest(
          ATLAS_DRAFT.id,
          FILE_COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });
});

async function doSourceDatasetsRequest(
  atlasId: string,
  componentAtlasId: string,
  user?: TestUser,
  method = METHOD.GET,
  body?: Record<string, unknown>,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body,
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId, componentAtlasId),
  });
  await withConsoleErrorHiding(
    () => sourceDatasetsHandler(req, res),
    hideConsoleError
  );
  return res;
}

function getQueryValues(
  atlasId: string,
  componentAtlasId: string
): Record<string, string> {
  return { atlasId, componentAtlasId };
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

async function getComponentAtlasFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBComponentAtlas | undefined> {
  return (
    await query<HCAAtlasTrackerDBComponentAtlas>(
      "SELECT * FROM hat.component_atlases WHERE id=$1",
      [id]
    )
  ).rows[0];
}
