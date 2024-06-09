import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import sourceDatasetHandler from "../pages/api/atlases/[atlasId]/component-atlases/[componentAtlasId]/source-datasets/[sourceDatasetId]";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  COMPONENT_ATLAS_DRAFT_BAR,
  COMPONENT_ATLAS_DRAFT_FOO,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_FOOBAR,
  SOURCE_DATASET_FOOBAZ,
  SOURCE_DATASET_FOOFOO,
  TEST_SOURCE_STUDIES,
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
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

  it("returns error 401 when source dataset is requested by logged out user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOBAZ.id
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
          USER_UNREGISTERED
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns source dataset when requested by logged in user with STAKEHOLDER role", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_FOO.id,
      SOURCE_DATASET_FOOBAZ.id,
      USER_STAKEHOLDER
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset = res._getJSONData() as HCAAtlasTrackerSourceDataset;
    expectSourceDatasetsToMatch([sourceDataset], [SOURCE_DATASET_FOOBAZ]);
  });

  it("returns source dataset when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_FOO.id,
      SOURCE_DATASET_FOOBAZ.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset = res._getJSONData() as HCAAtlasTrackerSourceDataset;
    expectSourceDatasetsToMatch([sourceDataset], [SOURCE_DATASET_FOOBAZ]);
  });

  it("returns error 401 when POST requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          undefined,
          METHOD.POST
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
          METHOD.POST
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
          METHOD.POST
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
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 when POST requested from component atlas that already has the source dataset", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOOFOO.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 when POST requested with nonexistent source dataset", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_ID_NONEXISTENT,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("adds source dataset when POST requested", async () => {
    const sourceDatasetsBefore = await getComponentAtlasSourceDatasets(
      COMPONENT_ATLAS_DRAFT_FOO.id
    );

    const res = await doSourceDatasetRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_FOO.id,
      SOURCE_DATASET_FOO.id,
      USER_CONTENT_ADMIN,
      METHOD.POST
    );
    expect(res._getStatusCode()).toEqual(201);
    expectComponentAtlasToHaveSourceDatasets(COMPONENT_ATLAS_DRAFT_FOO, [
      SOURCE_DATASET_FOOFOO,
      SOURCE_DATASET_FOOBAR,
      SOURCE_DATASET_FOOBAZ,
      SOURCE_DATASET_FOO,
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
          METHOD.DELETE
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
          METHOD.DELETE
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
          METHOD.DELETE
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
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 when DELETE requested with nonexistent source dataset", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_ID_NONEXISTENT,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 when DELETE requested from component atlas the source dataset doesn't exist on", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          SOURCE_DATASET_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("deletes source dataset", async () => {
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
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);
    expectComponentAtlasToHaveSourceDatasets(COMPONENT_ATLAS_DRAFT_FOO, [
      SOURCE_DATASET_FOOBAR,
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
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: { atlasId, componentAtlasId, sourceDatasetId },
  });
  await withConsoleErrorHiding(
    () => sourceDatasetHandler(req, res),
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
    const sourceStudy = TEST_SOURCE_STUDIES.find(
      (s) => s.id === testSourceDataset.sourceStudyId
    );
    if (sourceStudy)
      expect(sourceDataset.sourceStudyTitle).toEqual(
        "publication" in sourceStudy
          ? sourceStudy.publication?.title
          : sourceStudy.unpublishedInfo?.title ?? null
      );
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
