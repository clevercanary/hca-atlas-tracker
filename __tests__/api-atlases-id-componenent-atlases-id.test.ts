import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerDBComponentAtlas,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { ComponentAtlasEditData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbComponentAtlasToApiComponentAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import componentAtlasHandler from "../pages/api/atlases/[atlasId]/component-atlases/[componentAtlasId]";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  COMPONENT_ATLAS_DRAFT_FOO,
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestComponentAtlas, TestUser } from "../testing/entities";
import { withConsoleErrorHiding } from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const COMPONENT_ATLAS_DRAFT_FOO_EDIT: ComponentAtlasEditData = {
  title: "Component Atlas Draft Foo Edited",
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("/api/atlases/[atlasId]/component-atlases/[componentAtlasId]", () => {
  it("returns error 405 for PUT request", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          undefined,
          METHOD.PUT
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when component atlas is GET requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when component atlas is GET requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_UNREGISTERED
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 404 when component atlas is GET requested by user with CONTENT_ADMIN role via atlas it doesn't exist on", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_PUBLIC.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          undefined,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns component atlas from draft atlas when GET requested by logged in user with STAKEHOLDER role", async () => {
    const res = await doComponentAtlasRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_FOO.id,
      USER_STAKEHOLDER
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlas = res._getJSONData() as HCAAtlasTrackerComponentAtlas;
    expect(componentAtlas.title).toEqual(COMPONENT_ATLAS_DRAFT_FOO.title);
  });

  it("returns component atlas from draft atlas when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doComponentAtlasRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_FOO.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlas = res._getJSONData() as HCAAtlasTrackerComponentAtlas;
    expect(componentAtlas.title).toEqual(COMPONENT_ATLAS_DRAFT_FOO.title);
  });

  it("returns error 401 when component atlas is PATCH requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          undefined,
          METHOD.PATCH,
          COMPONENT_ATLAS_DRAFT_FOO_EDIT
        )
      )._getStatusCode()
    ).toEqual(401);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when component atlas is PATCH requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_STAKEHOLDER,
          METHOD.PATCH,
          COMPONENT_ATLAS_DRAFT_FOO_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when component atlas is PATCH requested from draft atlas by logged in user with STAKEHOLDER role", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_STAKEHOLDER,
          METHOD.PATCH,
          COMPONENT_ATLAS_DRAFT_FOO_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 404 when component atlas is PATCH requested from atlas it doesn't exist on", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_PUBLIC.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          COMPONENT_ATLAS_DRAFT_FOO_EDIT,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 400 for component atlas PATCH requested with title set to undefined", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          {
            ...COMPONENT_ATLAS_DRAFT_FOO_EDIT,
            title: undefined,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("updates and returns component atlas when PATCH requested", async () => {
    const res = await doComponentAtlasRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_FOO.id,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      COMPONENT_ATLAS_DRAFT_FOO_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedComponentAtlas = res._getJSONData();
    const componentAtlasFromDb = await getComponentAtlasFromDatabase(
      updatedComponentAtlas.id
    );
    expect(componentAtlasFromDb).toBeDefined();
    if (!componentAtlasFromDb) return;
    expect(componentAtlasFromDb.component_info.title).toEqual(
      COMPONENT_ATLAS_DRAFT_FOO_EDIT.title
    );
    expect(dbComponentAtlasToApiComponentAtlas(componentAtlasFromDb)).toEqual(
      updatedComponentAtlas
    );

    await restoreDbComponentAtlas(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 401 when component atlas is DELETE requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          undefined,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(401);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when component atlas is DELETE requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_STAKEHOLDER,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when component atlas is DELETE requested from draft atlas by logged in user with STAKEHOLDER role", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_STAKEHOLDER,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 404 when component atlas is DELETE requested from atlas it doesn't exist on", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_PUBLIC.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("deletes component atlas", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);
    const componentAtlasQueryResult = await query(
      "SELECT * FROM hat.component_atlases WHERE id=$1",
      [COMPONENT_ATLAS_DRAFT_FOO.id]
    );
    expect(componentAtlasQueryResult.rows[0]).toBeUndefined();

    await query(
      "INSERT INTO hat.component_atlases (atlas_id, component_info, id) VALUES ($1, $2, $3)",
      [
        ATLAS_DRAFT.id,
        JSON.stringify({
          cellxgeneDatasetId: null,
          cellxgeneDatasetVersion: null,
          title: COMPONENT_ATLAS_DRAFT_FOO.title,
        }),
        COMPONENT_ATLAS_DRAFT_FOO.id,
      ]
    );
  });
});

async function doComponentAtlasRequest(
  atlasId: string,
  componentAtlasId: string,
  user?: TestUser,
  method = METHOD.GET,
  updatedData?: Record<string, unknown>,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: updatedData,
    headers: { authorization: user?.authorization },
    method,
    query: { atlasId, componentAtlasId },
  });
  await withConsoleErrorHiding(
    () => componentAtlasHandler(req, res),
    hideConsoleError
  );
  return res;
}

async function restoreDbComponentAtlas(
  componentAtlas: TestComponentAtlas
): Promise<void> {
  await query(
    "UPDATE hat.component_atlases SET component_info=$1 WHERE id=$2",
    [
      JSON.stringify({
        cellxgeneDatasetId: null,
        cellxgeneDatasetVersion: null,
        title: componentAtlas.title,
      }),
      componentAtlas.id,
    ]
  );
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