import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { dbComponentAtlasToApiComponentAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import {
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerDBComponentAtlas,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { NewComponentAtlasData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import createHandler from "../pages/api/atlases/[atlasId]/component-atlases/create";
import {
  ATLAS_DRAFT,
  ATLAS_NONEXISTENT,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestAtlas, TestUser } from "../testing/entities";
import { testApiRole, withConsoleErrorHiding } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

const NEW_COMPONENT_ATLAS_DATA: NewComponentAtlasData = {
  description: "New component atlas description",
  title: "New Component Atlas",
};

const NEW_COMPONENT_ATLAS_FOO_DATA: NewComponentAtlasData = {
  description: "New component atlas foo description",
  title: "New Component Atlas Foo",
};

const NEW_COMPONENT_ATLAS_WITHOUT_DESCRIPTION_DATA: NewComponentAtlasData = {
  title: "New Component Atlas Without Description",
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
        await doCreateTest(
          undefined,
          ATLAS_DRAFT,
          NEW_COMPONENT_ATLAS_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCreateTest(
          USER_UNREGISTERED,
          ATLAS_DRAFT,
          NEW_COMPONENT_ATLAS_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 for disabled user", async () => {
    expect(
      (
        await doCreateTest(
          USER_DISABLED_CONTENT_ADMIN,
          ATLAS_DRAFT,
          NEW_COMPONENT_ATLAS_DATA
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      "/api/atlases/[atlasId]/component-atlases/create",
      createHandler,
      METHOD.POST,
      role,
      getQueryValues(ATLAS_DRAFT),
      NEW_COMPONENT_ATLAS_DATA,
      false,
      (res) => expect(res._getStatusCode()).toEqual(403)
    );
  }

  it("returns error 403 when requested by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doCreateTest(
          USER_INTEGRATION_LEAD_PUBLIC,
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

  it("returns error 400 when description is too long", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_DRAFT,
          {
            ...NEW_COMPONENT_ATLAS_DATA,
            description: "x".repeat(10001),
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates and returns component atlas entry when requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    await testSuccessfulCreate(ATLAS_DRAFT, NEW_COMPONENT_ATLAS_FOO_DATA);
  });

  it("creates and returns component atlas entry when requested by user with CONTENT_ADMIN role", async () => {
    await testSuccessfulCreate(ATLAS_DRAFT, NEW_COMPONENT_ATLAS_DATA);
  });

  it("creates and returns component atlas entry without description specified", async () => {
    await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_COMPONENT_ATLAS_WITHOUT_DESCRIPTION_DATA
    );
  });
});

async function testSuccessfulCreate(
  atlas: TestAtlas,
  newData: NewComponentAtlasData
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
    newData
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
    query: getQueryValues(atlas),
  });
  await withConsoleErrorHiding(() => createHandler(req, res), hideConsoleError);
  return res;
}

function getQueryValues(atlas: Pick<TestAtlas, "id">): Record<string, string> {
  return { atlasId: atlas.id };
}

function expectDbComponentAtlasToMatch(
  dbComponentAtlas: HCAAtlasTrackerDBComponentAtlas,
  apiComponentAtlas: HCAAtlasTrackerComponentAtlas,
  atlasId: string,
  data: NewComponentAtlasData
): void {
  expect(dbComponentAtlas).toBeDefined();
  expect(dbComponentAtlas.atlas_id).toEqual(atlasId);
  expect(dbComponentAtlas.component_info.description).toEqual(
    data.description ?? ""
  );
  expect(dbComponentAtlas.title).toEqual(data.title);
  expect(dbComponentAtlasToApiComponentAtlas(dbComponentAtlas)).toEqual(
    apiComponentAtlas
  );
}
