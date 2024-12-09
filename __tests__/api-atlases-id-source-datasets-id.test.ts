import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerDBAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import sourceDatasetHandler from "../pages/api/atlases/[atlasId]/source-datasets/[sourceDatasetId]";
import {
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  SOURCE_DATASET_ATLAS_LINKED_B_BAR,
  SOURCE_DATASET_ATLAS_LINKED_B_BAZ,
  SOURCE_DATASET_ATLAS_LINKED_B_FOO,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  expectAtlasToBeUnchanged,
  getAtlasFromDatabase,
  resetDatabase,
} from "../testing/db-utils";
import { TestAtlas, TestUser } from "../testing/entities";
import {
  expectAtlasDatasetsToHaveDifference,
  expectIsDefined,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const TEST_ROUTE = "/api/atlases/[atlasId]/source-datasets/[sourceDatasetId]";

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
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_B_BAZ.id,
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
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_B_BAZ.id,
          undefined,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES);
  });

  it("returns error 403 when POST requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_B_BAZ.id,
          USER_UNREGISTERED,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES);
  });

  it("returns error 403 when POST requested from draft atlas by disabled user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_B_BAZ.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      sourceDatasetHandler,
      METHOD.POST,
      role,
      getQueryValues(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
        SOURCE_DATASET_ATLAS_LINKED_B_BAZ.id
      ),
      undefined,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES);
      }
    );
  }

  it("returns error 403 when POST requested from draft atlas by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_B_BAZ.id,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES);
  });

  it("returns error 400 when POST requested with source dataset the atlas already has", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_B_BAR.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES);
  });

  it("returns error 400 when POST requested with nonexistent source dataset", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ID_NONEXISTENT,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES);
  });

  it("returns error 400 when POST requested with source dataset not on a source study of the atlas", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          SOURCE_DATASET_ATLAS_LINKED_B_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES_B);
  });

  it("adds source dataset when POST requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    const atlasBefore = await getAtlasFromDatabase(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id
    );

    const sourceDatasetsBefore = await getAtlasSourceDatasets(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id
    );

    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_DATASET_ATLAS_LINKED_B_BAZ.id,
      USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
      METHOD.POST
    );
    expect(res._getStatusCode()).toEqual(201);

    const atlasAfter = await getAtlasFromDatabase(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id
    );

    if (expectIsDefined(atlasBefore) && expectIsDefined(atlasAfter)) {
      expectAtlasDatasetsToHaveDifference(atlasBefore, atlasAfter, [
        SOURCE_DATASET_ATLAS_LINKED_B_BAZ,
      ]);
    }

    expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES_B);

    await setAtlasSourceDatasets(
      ATLAS_WITH_MISC_SOURCE_STUDIES,
      sourceDatasetsBefore
    );
  });

  it("adds source dataset when POST requested by user with CONTENT_ADMIN role", async () => {
    const atlasBefore = await getAtlasFromDatabase(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id
    );

    const sourceDatasetsBefore = await getAtlasSourceDatasets(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id
    );

    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_DATASET_ATLAS_LINKED_B_BAZ.id,
      USER_CONTENT_ADMIN,
      METHOD.POST
    );
    expect(res._getStatusCode()).toEqual(201);

    const atlasAfter = await getAtlasFromDatabase(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id
    );

    if (expectIsDefined(atlasBefore) && expectIsDefined(atlasAfter)) {
      expectAtlasDatasetsToHaveDifference(atlasBefore, atlasAfter, [
        SOURCE_DATASET_ATLAS_LINKED_B_BAZ,
      ]);
    }

    expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES_B);

    await setAtlasSourceDatasets(
      ATLAS_WITH_MISC_SOURCE_STUDIES,
      sourceDatasetsBefore
    );
  });

  it("returns error 401 when DELETE requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          undefined,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES);
  });

  it("returns error 403 when DELETE requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          USER_UNREGISTERED,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES);
  });

  it("returns error 403 when DELETE requested from draft atlas by disabled user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      sourceDatasetHandler,
      METHOD.DELETE,
      role,
      getQueryValues(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
        SOURCE_DATASET_ATLAS_LINKED_A_FOO.id
      ),
      undefined,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES);
      }
    );
  }

  it("returns error 403 when DELETE requested from draft atlas by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES);
  });

  it("returns error 400 when DELETE requested with nonexistent source dataset", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ID_NONEXISTENT,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES);
  });

  it("returns error 400 when DELETE requested with source dataset the atlas doesn't have", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_B_BAZ.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES);
  });

  it("deletes source dataset when requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    const atlasBefore = await getAtlasFromDatabase(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id
    );

    const sourceDatasetsBefore = await getAtlasSourceDatasets(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id
    );

    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);

    const atlasAfter = await getAtlasFromDatabase(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id
    );

    if (expectIsDefined(atlasBefore) && expectIsDefined(atlasAfter)) {
      expectAtlasDatasetsToHaveDifference(atlasAfter, atlasBefore, [
        SOURCE_DATASET_ATLAS_LINKED_A_FOO,
      ]);
    }

    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES_B);

    await setAtlasSourceDatasets(
      ATLAS_WITH_MISC_SOURCE_STUDIES,
      sourceDatasetsBefore
    );
  });

  it("deletes source dataset when requested by user with CONTENT_ADMIN role", async () => {
    const atlasBefore = await getAtlasFromDatabase(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id
    );

    const sourceDatasetsBefore = await getAtlasSourceDatasets(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id
    );

    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);

    const atlasAfter = await getAtlasFromDatabase(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id
    );

    if (expectIsDefined(atlasBefore) && expectIsDefined(atlasAfter)) {
      expectAtlasDatasetsToHaveDifference(atlasAfter, atlasBefore, [
        SOURCE_DATASET_ATLAS_LINKED_A_FOO,
      ]);
    }

    await expectAtlasToBeUnchanged(ATLAS_WITH_MISC_SOURCE_STUDIES_B);

    await setAtlasSourceDatasets(
      ATLAS_WITH_MISC_SOURCE_STUDIES,
      sourceDatasetsBefore
    );
  });
});

async function doSourceDatasetRequest(
  atlasId: string,
  sourceDatasetId: string,
  user?: TestUser,
  method = METHOD.POST,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId, sourceDatasetId),
  });
  await withConsoleErrorHiding(
    () => sourceDatasetHandler(req, res),
    hideConsoleError
  );
  return res;
}

function getQueryValues(
  atlasId: string,
  sourceDatasetId: string
): Record<string, string> {
  return { atlasId, sourceDatasetId };
}

async function setAtlasSourceDatasets(
  atlas: TestAtlas,
  sourceDatasets: string[]
): Promise<void> {
  await query("UPDATE hat.atlases SET source_datasets=$1 WHERE id=$2", [
    sourceDatasets,
    atlas.id,
  ]);
}

async function getAtlasSourceDatasets(id: string): Promise<string[]> {
  return (
    await query<HCAAtlasTrackerDBAtlas>(
      "SELECT * FROM hat.atlases WHERE id=$1",
      [id]
    )
  ).rows[0].source_datasets;
}
