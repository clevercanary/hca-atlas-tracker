import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerDBAtlas,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasEditData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import atlasHandler from "../pages/api/atlases/[atlasId]";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  ATLAS_WITH_IL,
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestAtlas, TestUser } from "../testing/entities";
import {
  makeTestAtlasOverview,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/utils/pg-app-connect-config");

const ATLAS_ID_NONEXISTENT = "f643a5ff-0803-4bf1-b650-184161220bc2";

const ATLAS_PUBLIC_EDIT: AtlasEditData = {
  integrationLead: [
    {
      email: "bar@example.com",
      name: "Bar",
    },
  ],
  network: ATLAS_PUBLIC.network,
  shortName: "test-public-edited",
  targetCompletion: "2024-06-09T12:21:52.277Z",
  version: "2.0",
  wave: "2",
};

const ATLAS_WITH_IL_EDIT: AtlasEditData = {
  integrationLead: [],
  network: "development",
  shortName: ATLAS_WITH_IL.shortName,
  version: "2.1",
  wave: ATLAS_WITH_IL.wave,
};

const ATLAS_DRAFT_EDIT: AtlasEditData = {
  integrationLead: [
    {
      email: "foofoo@example.com",
      name: "Foo Foo",
    },
    {
      email: "foobar@example.com",
      name: "Foo Bar",
    },
    {
      email: "foobaz@example.com",
      name: "Foo Baz",
    },
  ],
  network: "development",
  shortName: "test3",
  version: "1.2",
  wave: "3",
};

const ATLAS_PUBLIC_EDIT_NO_TARGET_COMPLETION: AtlasEditData = {
  integrationLead: ATLAS_DRAFT.integrationLead,
  network: ATLAS_DRAFT.network,
  shortName: ATLAS_DRAFT.shortName,
  version: ATLAS_DRAFT.version,
  wave: ATLAS_DRAFT.wave,
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("/api/atlases/[id]", () => {
  it("returns error 405 for non-GET, non-PUT request", async () => {
    expect(
      (
        await doAtlasRequest(ATLAS_PUBLIC.id, undefined, false, METHOD.POST)
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when public atlas is GET requested by logged out user", async () => {
    expect((await doAtlasRequest(ATLAS_PUBLIC.id))._getStatusCode()).toEqual(
      401
    );
  });

  it("returns error 403 when public atlas is GET requested by unregistered user", async () => {
    expect(
      (
        await doAtlasRequest(ATLAS_PUBLIC.id, USER_UNREGISTERED)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 401 when draft atlas is GET requested by logged out user", async () => {
    expect((await doAtlasRequest(ATLAS_DRAFT.id))._getStatusCode()).toEqual(
      401
    );
  });

  it("returns error 403 when draft atlas is GET requested by unregistered user", async () => {
    expect(
      (await doAtlasRequest(ATLAS_DRAFT.id, USER_UNREGISTERED))._getStatusCode()
    ).toEqual(403);
  });

  it("GET returns error 404 when nonexistent atlas is requested", async () => {
    expect(
      (
        await doAtlasRequest(ATLAS_ID_NONEXISTENT, USER_CONTENT_ADMIN, true)
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns public atlas when GET requested by user with STAKEHOLDER role", async () => {
    const res = await doAtlasRequest(ATLAS_PUBLIC.id, USER_STAKEHOLDER);
    expect(res._getStatusCode()).toEqual(200);
    const atlas = res._getJSONData() as HCAAtlasTrackerAtlas;
    expect(atlas.shortName).toEqual(ATLAS_PUBLIC.shortName);
  });

  it("returns draft atlas when GET requested by logged in user with STAKEHOLDER role", async () => {
    const res = await doAtlasRequest(ATLAS_DRAFT.id, USER_STAKEHOLDER);
    expect(res._getStatusCode()).toEqual(200);
    const atlas = res._getJSONData() as HCAAtlasTrackerAtlas;
    expect(atlas.bioNetwork).toEqual(ATLAS_DRAFT.network);
    expect(atlas.id).toEqual(ATLAS_DRAFT.id);
    expect(atlas.integrationLead).toEqual(ATLAS_DRAFT.integrationLead);
    expect(atlas.shortName).toEqual(ATLAS_DRAFT.shortName);
    expect(atlas.sourceStudyCount).toEqual(ATLAS_DRAFT.sourceStudies.length);
    expect(atlas.status).toEqual(ATLAS_DRAFT.status);
    expect(atlas.version).toEqual(ATLAS_DRAFT.version);
    expect(atlas.wave).toEqual(ATLAS_DRAFT.wave);
    expect(atlas.componentAtlasCount).toEqual(2);
  });

  it("returns draft atlas when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doAtlasRequest(ATLAS_DRAFT.id, USER_CONTENT_ADMIN);
    expect(res._getStatusCode()).toEqual(200);
    const atlas = res._getJSONData() as HCAAtlasTrackerAtlas;
    expect(atlas.bioNetwork).toEqual(ATLAS_DRAFT.network);
    expect(atlas.id).toEqual(ATLAS_DRAFT.id);
    expect(atlas.integrationLead).toEqual(ATLAS_DRAFT.integrationLead);
    expect(atlas.shortName).toEqual(ATLAS_DRAFT.shortName);
    expect(atlas.sourceStudyCount).toEqual(ATLAS_DRAFT.sourceStudies.length);
    expect(atlas.status).toEqual(ATLAS_DRAFT.status);
    expect(atlas.version).toEqual(ATLAS_DRAFT.version);
    expect(atlas.wave).toEqual(ATLAS_DRAFT.wave);
    expect(atlas.componentAtlasCount).toEqual(2);
  });

  it("returns error 401 when public atlas is PUT requested by logged out user", async () => {
    expect(
      (
        await doAtlasRequest(
          ATLAS_PUBLIC.id,
          undefined,
          false,
          METHOD.PUT,
          ATLAS_PUBLIC_EDIT
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when public atlas is PUT requested by unregistered user", async () => {
    expect(
      (
        await doAtlasRequest(
          ATLAS_PUBLIC.id,
          USER_UNREGISTERED,
          false,
          METHOD.PUT,
          ATLAS_PUBLIC_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when public atlas is PUT requested by logged in user with STAKEHOLDER role", async () => {
    expect(
      (
        await doAtlasRequest(
          ATLAS_PUBLIC.id,
          USER_STAKEHOLDER,
          false,
          METHOD.PUT,
          ATLAS_PUBLIC_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("PUT returns error 404 when nonexistent atlas is requested", async () => {
    expect(
      (
        await doAtlasRequest(
          ATLAS_ID_NONEXISTENT,
          USER_CONTENT_ADMIN,
          true,
          METHOD.PUT,
          ATLAS_PUBLIC_EDIT
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("PUT returns error 400 when network value is not a valid network key", async () => {
    expect(
      (
        await doAtlasRequest(
          ATLAS_PUBLIC.id,
          USER_CONTENT_ADMIN,
          true,
          METHOD.PUT,
          {
            ...ATLAS_PUBLIC_EDIT,
            network: "notanetwork" as AtlasEditData["network"],
          }
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("PUT returns error 400 when version is a number rather than a string", async () => {
    expect(
      (
        await doAtlasRequest(
          ATLAS_PUBLIC.id,
          USER_CONTENT_ADMIN,
          true,
          METHOD.PUT,
          {
            ...ATLAS_PUBLIC_EDIT,
            version: 1 as unknown as AtlasEditData["version"],
          }
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("PUT returns error 400 when wave is not a valid wave value", async () => {
    expect(
      (
        await doAtlasRequest(
          ATLAS_PUBLIC.id,
          USER_CONTENT_ADMIN,
          true,
          METHOD.PUT,
          {
            ...ATLAS_PUBLIC_EDIT,
            wave: "0" as AtlasEditData["wave"],
          }
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("PUT returns error 400 when integration lead is undefined", async () => {
    expect(
      (
        await doAtlasRequest(
          ATLAS_PUBLIC.id,
          USER_CONTENT_ADMIN,
          true,
          METHOD.PUT,
          {
            ...ATLAS_PUBLIC_EDIT,
            integrationLead:
              undefined as unknown as AtlasEditData["integrationLead"],
          }
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("PUT returns error 400 when integration lead is missing name", async () => {
    expect(
      (
        await doAtlasRequest(
          ATLAS_PUBLIC.id,
          USER_CONTENT_ADMIN,
          true,
          METHOD.PUT,
          {
            ...ATLAS_PUBLIC_EDIT,
            integrationLead: [
              {
                email: "bar@example.com",
              },
            ] as AtlasEditData["integrationLead"],
          }
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("PUT returns error 400 when target completion is non-UTC", async () => {
    expect(
      (
        await doAtlasRequest(
          ATLAS_PUBLIC.id,
          USER_CONTENT_ADMIN,
          true,
          METHOD.PUT,
          {
            ...ATLAS_PUBLIC_EDIT,
            targetCompletion: "2024-06-09T05:21:52.277-0700",
          }
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("PUT updates and returns atlas entry", async () => {
    await testSuccessfulEdit(ATLAS_PUBLIC, ATLAS_PUBLIC_EDIT, 0);
  });

  it("PUT updates and returns atlas entry with integration lead set to empty array", async () => {
    await testSuccessfulEdit(ATLAS_WITH_IL, ATLAS_WITH_IL_EDIT, 0);
  });

  it("PUT updates and returns atlas entry with multiple integration leads", async () => {
    await testSuccessfulEdit(ATLAS_DRAFT, ATLAS_DRAFT_EDIT, 2);
  });

  it("PUT updates and returns atlas entry with target completion removed", async () => {
    const updatedAtlas = await testSuccessfulEdit(
      ATLAS_PUBLIC,
      ATLAS_PUBLIC_EDIT_NO_TARGET_COMPLETION,
      0
    );
    expect(updatedAtlas.target_completion).toBeNull();
  });
});

async function testSuccessfulEdit(
  testAtlas: TestAtlas,
  editData: AtlasEditData,
  expectedComponentAtlasCount: number
): Promise<HCAAtlasTrackerDBAtlas> {
  const res = await doAtlasRequest(
    testAtlas.id,
    USER_CONTENT_ADMIN,
    false,
    METHOD.PUT,
    editData
  );
  expect(res._getStatusCode()).toEqual(200);
  const updatedAtlas: HCAAtlasTrackerAtlas = res._getJSONData();
  const updatedAtlasFromDb = (
    await query<HCAAtlasTrackerDBAtlas>(
      "SELECT * FROM hat.atlases WHERE id=$1",
      [testAtlas.id]
    )
  ).rows[0];

  const updatedOverview = updatedAtlasFromDb.overview;

  expect(updatedOverview.integrationLead).toEqual(editData.integrationLead);
  expect(updatedOverview.network).toEqual(editData.network);
  expect(updatedOverview.shortName).toEqual(editData.shortName);
  expect(updatedOverview.version).toEqual(editData.version);
  expect(updatedOverview.wave).toEqual(editData.wave);

  expect(updatedAtlas.targetCompletion).toEqual(
    editData.targetCompletion ?? null
  );

  expectAtlasPropertiesToMatch(
    updatedAtlasFromDb,
    updatedAtlas,
    expectedComponentAtlasCount
  );

  const overview = makeTestAtlasOverview(testAtlas);
  await query(
    "UPDATE hat.atlases SET overview=$1, target_completion=$2 WHERE id=$3",
    [JSON.stringify(overview), testAtlas.targetCompletion ?? null, testAtlas.id]
  );

  return updatedAtlasFromDb;
}

function expectAtlasPropertiesToMatch(
  dbAtlas: HCAAtlasTrackerDBAtlas,
  apiAtlas: HCAAtlasTrackerAtlas,
  expectedComponentAtlasCount: number
): void {
  expect(dbAtlas.overview.network).toEqual(apiAtlas.bioNetwork);
  expect(dbAtlas.overview.completedTaskCount).toEqual(
    apiAtlas.completedTaskCount
  );
  expect(dbAtlas.id).toEqual(apiAtlas.id);
  expect(dbAtlas.overview.integrationLead).toEqual(apiAtlas.integrationLead);
  expect(dbAtlas.overview.shortName).toEqual(apiAtlas.shortName);
  expect(dbAtlas.source_studies).toHaveLength(apiAtlas.sourceStudyCount);
  expect(dbAtlas.status).toEqual(apiAtlas.status);
  expect(dbAtlas.target_completion?.toISOString() ?? null).toEqual(
    apiAtlas.targetCompletion
  );
  expect(dbAtlas.overview.taskCount).toEqual(apiAtlas.taskCount);
  expect(dbAtlas.overview.version).toEqual(apiAtlas.version);
  expect(dbAtlas.overview.wave).toEqual(apiAtlas.wave);
  expect(apiAtlas.componentAtlasCount).toEqual(expectedComponentAtlasCount);
}

async function doAtlasRequest(
  atlasId: string,
  user?: TestUser,
  hideConsoleError = false,
  method = METHOD.GET,
  updatedData?: AtlasEditData
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: updatedData,
    headers: { authorization: user?.authorization },
    method,
    query: { atlasId },
  });
  await withConsoleErrorHiding(() => atlasHandler(req, res), hideConsoleError);
  return res;
}
