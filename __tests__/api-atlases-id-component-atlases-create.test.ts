import { METHOD } from "app/common/entities";
import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerDBComponentAtlas,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { NewComponentAtlasData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbComponentAtlasToApiComponentAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/utils";
import { endPgPool, query } from "../app/services/database";
import createHandler from "../pages/api/atlases/[atlasId]/component-atlases/create";
import {
  ATLAS_DRAFT,
  ATLAS_NONEXISTENT,
  USER_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestAtlas, TestUser } from "../testing/entities";
import { withConsoleErrorHiding } from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const NEW_COMPONENT_ATLAS_DATA: NewComponentAtlasData = {
  title: "New Component Atlas",
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("/api/atlases/[atlasId]/component-atlases/create", () => {
  it("returns error 405 for non-POST request", async () => {
    expect(
      (
        await doCreateTest(
          undefined,
          ATLAS_DRAFT,
          NEW_COMPONENT_ATLAS_DATA,
          false,
          METHOD.GET
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (
        await doCreateTest(undefined, ATLAS_DRAFT, NEW_COMPONENT_ATLAS_DATA)
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCreateTest(
          USER_UNREGISTERED,
          ATLAS_DRAFT,
          NEW_COMPONENT_ATLAS_DATA
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 for logged in user with STAKEHOLDER role", async () => {
    expect(
      (
        await doCreateTest(
          USER_STAKEHOLDER,
          ATLAS_DRAFT,
          NEW_COMPONENT_ATLAS_DATA
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 for logged in user with INTEGRATION_LEAD role for the atlas", async () => {
    expect(
      (
        await doCreateTest(
          USER_INTEGRATION_LEAD_DRAFT,
          ATLAS_DRAFT,
          NEW_COMPONENT_ATLAS_DATA
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 404 when specified atlas doesn't exist", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_NONEXISTENT,
          NEW_COMPONENT_ATLAS_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns error 400 when title is not a string", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_DRAFT,
          {
            ...NEW_COMPONENT_ATLAS_DATA,
            title: 123,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when title is empty string", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_DRAFT,
          {
            ...NEW_COMPONENT_ATLAS_DATA,
            title: "",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates and returns component atlas entry", async () => {
    await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_COMPONENT_ATLAS_DATA,
      NEW_COMPONENT_ATLAS_DATA.title
    );
  });
});

async function testSuccessfulCreate(
  atlas: TestAtlas,
  newData: Record<string, unknown>,
  expectedTitle: string
): Promise<HCAAtlasTrackerDBComponentAtlas> {
  const res = await doCreateTest(USER_CONTENT_ADMIN, atlas, newData);
  expect(res._getStatusCode()).toEqual(201);
  const newComponentAtlas: HCAAtlasTrackerComponentAtlas = res._getJSONData();
  const newComponentAtlasFromDb = (
    await query<HCAAtlasTrackerDBComponentAtlas>(
      "SELECT * FROM hat.component_atlases WHERE id=$1",
      [newComponentAtlas.id]
    )
  ).rows[0];
  expectDbComponentAtlasToMatch(
    newComponentAtlasFromDb,
    newComponentAtlas,
    atlas.id,
    expectedTitle
  );
  return newComponentAtlasFromDb;
}

async function doCreateTest(
  user: TestUser | undefined,
  atlas: Pick<TestAtlas, "id">,
  newData: Record<string, unknown>,
  hideConsoleError = false,
  method = METHOD.POST
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: newData,
    headers: { authorization: user?.authorization },
    method,
    query: { atlasId: atlas.id },
  });
  await withConsoleErrorHiding(() => createHandler(req, res), hideConsoleError);
  return res;
}

function expectDbComponentAtlasToMatch(
  dbComponentAtlas: HCAAtlasTrackerDBComponentAtlas,
  apiComponentAtlas: HCAAtlasTrackerComponentAtlas,
  atlasId: string,
  title: string
): void {
  expect(dbComponentAtlas).toBeDefined();
  expect(dbComponentAtlas.atlas_id).toEqual(atlasId);
  expect(dbComponentAtlas.title).toEqual(title);
  expect(dbComponentAtlasToApiComponentAtlas(dbComponentAtlas)).toEqual(
    apiComponentAtlas
  );
}
