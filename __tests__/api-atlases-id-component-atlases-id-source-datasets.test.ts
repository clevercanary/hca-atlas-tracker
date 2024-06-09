import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerDBComponentAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
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
  COMPONENT_ATLAS_DRAFT_BAR,
  COMPONENT_ATLAS_DRAFT_FOO,
  SOURCE_DATASET_BAR,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_FOOBAR,
  SOURCE_DATASET_FOOBAZ,
  SOURCE_DATASET_FOOFOO,
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import {
  TestComponentAtlas,
  TestSourceDataset,
  TestUser,
} from "../testing/entities";
import { withConsoleErrorHiding } from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

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

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("/api/atlases/[atlasId]/component-atlases/[componentAtlasId]/source-datasets/[sourceDatasetId]", () => {
  it("returns error 405 for PUT request", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          undefined,
          METHOD.PUT
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when POST requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          undefined,
          METHOD.POST,
          NEW_DATASETS_DATA
        )
      )._getStatusCode()
    ).toEqual(401);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when POST requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          USER_STAKEHOLDER,
          METHOD.POST,
          NEW_DATASETS_DATA
        )
      )._getStatusCode()
    ).toEqual(403);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when POST requested from draft atlas by logged in user with STAKEHOLDER role", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          USER_STAKEHOLDER,
          METHOD.POST,
          NEW_DATASETS_DATA
        )
      )._getStatusCode()
    ).toEqual(403);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 404 when POST requested from atlas the component atlas doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_PUBLIC.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          NEW_DATASETS_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 when POST requested from component atlas that already has one of the source datasets", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOFOO.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          NEW_DATASETS_WITH_EXISTING_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 for POST requested where one of the source datasets doesn't exist", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOFOO.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          NEW_DATASETS_WITH_NONEXISTENT_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("adds source datasets when POST requested", async () => {
    const sourceDatasetsBefore = await getComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_DRAFT_FOO.id
    );

    const res = await doSourceDatasetRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_FOO.id,
      SOURCE_DATASET_FOO.id,
      USER_CONTENT_ADMIN,
      METHOD.POST,
      NEW_DATASETS_DATA
    );
    expect(res._getStatusCode()).toEqual(201);
    expectComponentAtlasToHaveSourceDatasets(COMPONENT_ATLAS_DRAFT_FOO, [
      SOURCE_DATASET_FOOFOO,
      SOURCE_DATASET_FOOBAR,
      SOURCE_DATASET_FOOBAZ,
      SOURCE_DATASET_FOO,
      SOURCE_DATASET_BAR,
    ]);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_BAR);

    await query("UPDATE hat.component_atlases SET source_datasets=$1", [
      sourceDatasetsBefore,
    ]);
  });

  it("returns error 401 when DELETE requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOFOO.id,
          undefined,
          METHOD.DELETE,
          DELETE_DATASETS_DATA
        )
      )._getStatusCode()
    ).toEqual(401);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when DELETE requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOFOO.id,
          USER_STAKEHOLDER,
          METHOD.DELETE,
          DELETE_DATASETS_DATA
        )
      )._getStatusCode()
    ).toEqual(403);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when DELETE requested from draft atlas by logged in user with STAKEHOLDER role", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOFOO.id,
          USER_STAKEHOLDER,
          METHOD.DELETE,
          DELETE_DATASETS_DATA
        )
      )._getStatusCode()
    ).toEqual(403);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 404 when DELETE requested from atlas the component atlas doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_PUBLIC.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOFOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 when DELETE requested from component atlas that one of the source datasets doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_WITH_MISSING_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 for DELETE request where one of the source datasets doesn't exist", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_WITH_NONEXISTENT_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("deletes source datasets", async () => {
    const sourceDatasetsBefore = await getComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_DRAFT_FOO.id
    );

    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOFOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          DELETE_DATASETS_DATA
        )
      )._getStatusCode()
    ).toEqual(200);
    expectComponentAtlasToHaveSourceDatasets(COMPONENT_ATLAS_DRAFT_FOO, [
      SOURCE_DATASET_FOOBAZ,
    ]);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_BAR);

    await query("UPDATE hat.component_atlases SET source_datasets=$1", [
      sourceDatasetsBefore,
    ]);
  });
});

async function doSourceDatasetRequest(
  atlasId: string,
  componentAtlasId: string,
  sourceDatasetId: string,
  user?: TestUser,
  method = METHOD.GET,
  body?: Record<string, unknown>,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body,
    headers: { authorization: user?.authorization },
    method,
    query: { atlasId, componentAtlasId, sourceDatasetId },
  });
  await withConsoleErrorHiding(
    () => sourceDatasetsHandler(req, res),
    hideConsoleError
  );
  return res;
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
  expect(componentAtlasFromDb.component_info.title).toEqual(
    componentAtlas.title
  );
}

async function expectComponentAtlasToHaveSourceDatasets(
  componentAtlas: TestComponentAtlas,
  expectedSourceDatasets: TestSourceDataset[]
): Promise<void> {
  const sourceDatasets = await getComponentAtlasSourceDatasets(
    componentAtlas.id
  );
  expect(sourceDatasets).toHaveLength(expectedSourceDatasets.length);
  for (const expectedDataset of expectedSourceDatasets) {
    expect(sourceDatasets).toContain(expectedDataset.id);
  }
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

async function getComponentAtlasSourceDatasets(id: string): Promise<string[]> {
  return (
    await query<HCAAtlasTrackerDBComponentAtlas>(
      "SELECT * FROM hat.component_atlases WHERE id=$1",
      [id]
    )
  ).rows[0].source_datasets;
}
