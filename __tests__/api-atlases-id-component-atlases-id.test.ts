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
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  COMPONENT_ATLAS_DRAFT_BAR,
  COMPONENT_ATLAS_DRAFT_FOO,
  COMPONENT_ATLAS_MISC_FOO,
  STAKEHOLDER_ANALOGOUS_ROLES,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestComponentAtlas, TestUser } from "../testing/entities";
import { testApiRole, withConsoleErrorHiding } from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const TEST_ROUTE =
  "/api/atlases/[atlasId]/component-atlases/[componentAtlasId]";

const COMPONENT_ATLAS_DRAFT_FOO_EDIT: ComponentAtlasEditData = {
  description: "Component atlas draft foo description edited",
  title: "Component Atlas Draft Foo Edited",
};

const COMPONENT_ATLAS_MISC_FOO_EDIT: ComponentAtlasEditData = {
  description: "Component atlas misc foo description edited",
  title: "Component Atlas Misc Foo Edited",
};

const COMPONENT_ATLAS_DRAFT_BAR_EDIT: ComponentAtlasEditData = {
  title: COMPONENT_ATLAS_DRAFT_BAR.title,
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

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns component atlas",
      TEST_ROUTE,
      componentAtlasHandler,
      METHOD.GET,
      role,
      getQueryValues(ATLAS_DRAFT.id, COMPONENT_ATLAS_DRAFT_FOO.id),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const componentAtlas =
          res._getJSONData() as HCAAtlasTrackerComponentAtlas;
        expect(componentAtlas.title).toEqual(COMPONENT_ATLAS_DRAFT_FOO.title);
        expect(componentAtlas.description).toEqual(
          COMPONENT_ATLAS_DRAFT_FOO.description
        );
      }
    );
  }

  it("returns component atlas from draft atlas when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doComponentAtlasRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_FOO.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlas = res._getJSONData() as HCAAtlasTrackerComponentAtlas;
    expect(componentAtlas.title).toEqual(COMPONENT_ATLAS_DRAFT_FOO.title);
    expect(componentAtlas.description).toEqual(
      COMPONENT_ATLAS_DRAFT_FOO.description
    );
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
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when component atlas is PATCH requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_UNREGISTERED,
          METHOD.PATCH,
          COMPONENT_ATLAS_DRAFT_FOO_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      componentAtlasHandler,
      METHOD.PATCH,
      role,
      getQueryValues(ATLAS_DRAFT.id, COMPONENT_ATLAS_DRAFT_FOO.id),
      COMPONENT_ATLAS_DRAFT_FOO_EDIT,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
      }
    );
  }

  it("returns error 403 when component atlas is PATCH requested by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.PATCH,
          COMPONENT_ATLAS_DRAFT_FOO_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
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
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
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
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("updates and returns component atlas when PATCH requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    const res = await doComponentAtlasRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      COMPONENT_ATLAS_MISC_FOO.id,
      USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
      METHOD.PATCH,
      COMPONENT_ATLAS_MISC_FOO_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedComponentAtlas = res._getJSONData();
    const componentAtlasFromDb = await getComponentAtlasFromDatabase(
      updatedComponentAtlas.id
    );
    expect(componentAtlasFromDb).toBeDefined();
    if (!componentAtlasFromDb) return;
    expect(componentAtlasFromDb.title).toEqual(
      COMPONENT_ATLAS_MISC_FOO_EDIT.title
    );
    expect(dbComponentAtlasToApiComponentAtlas(componentAtlasFromDb)).toEqual(
      updatedComponentAtlas
    );

    await restoreDbComponentAtlas(COMPONENT_ATLAS_MISC_FOO);
  });

  it("updates and returns component atlas when PATCH requested by user with CONTENT_ADMIN role", async () => {
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
    expect(componentAtlasFromDb.title).toEqual(
      COMPONENT_ATLAS_DRAFT_FOO_EDIT.title
    );
    expect(dbComponentAtlasToApiComponentAtlas(componentAtlasFromDb)).toEqual(
      updatedComponentAtlas
    );

    await restoreDbComponentAtlas(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("removes description when description is unspecified", async () => {
    const componentAtlasFromDbBefore = await getComponentAtlasFromDatabase(
      COMPONENT_ATLAS_DRAFT_BAR.id
    );
    expect(componentAtlasFromDbBefore?.component_info.description).toBeTruthy();

    const res = await doComponentAtlasRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_BAR.id,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      COMPONENT_ATLAS_DRAFT_BAR_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedComponentAtlas = res._getJSONData();
    const componentAtlasFromDb = await getComponentAtlasFromDatabase(
      COMPONENT_ATLAS_DRAFT_BAR.id
    );
    expect(componentAtlasFromDb).toBeDefined();
    if (!componentAtlasFromDb) return;
    expect(componentAtlasFromDb.title).toEqual(
      COMPONENT_ATLAS_DRAFT_BAR_EDIT.title
    );
    expect(dbComponentAtlasToApiComponentAtlas(componentAtlasFromDb)).toEqual(
      updatedComponentAtlas
    );

    expect(componentAtlasFromDb.component_info.description).toEqual("");

    await restoreDbComponentAtlas(COMPONENT_ATLAS_DRAFT_BAR);
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
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("returns error 403 when component atlas is DELETE requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_UNREGISTERED,
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
      componentAtlasHandler,
      METHOD.DELETE,
      role,
      getQueryValues(ATLAS_DRAFT.id, COMPONENT_ATLAS_DRAFT_FOO.id),
      undefined,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
      }
    );
  }

  it("returns error 403 when component atlas is DELETE requested by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
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
    await expectComponentAtlasToBeUnchanged(COMPONENT_ATLAS_DRAFT_FOO);
  });

  it("deletes component atlas when requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          COMPONENT_ATLAS_MISC_FOO.id,
          USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);
    expect(
      await getComponentAtlasFromDatabase(COMPONENT_ATLAS_MISC_FOO.id)
    ).toBeUndefined();

    await query(
      "INSERT INTO hat.component_atlases (atlas_id, component_info, id, title) VALUES ($1, $2, $3, $4)",
      [
        ATLAS_DRAFT.id,
        JSON.stringify({
          cellxgeneDatasetId: null,
          cellxgeneDatasetVersion: null,
        }),
        COMPONENT_ATLAS_MISC_FOO.id,
        COMPONENT_ATLAS_MISC_FOO.title,
      ]
    );
  });

  it("deletes component atlas when requested by user with CONTENT_ADMIN role", async () => {
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
    expect(
      await getComponentAtlasFromDatabase(COMPONENT_ATLAS_DRAFT_FOO.id)
    ).toBeUndefined();

    await query(
      "INSERT INTO hat.component_atlases (atlas_id, component_info, id, title) VALUES ($1, $2, $3, $4)",
      [
        ATLAS_DRAFT.id,
        JSON.stringify({
          cellxgeneDatasetId: null,
          cellxgeneDatasetVersion: null,
        }),
        COMPONENT_ATLAS_DRAFT_FOO.id,
        COMPONENT_ATLAS_DRAFT_FOO.title,
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
    query: getQueryValues(atlasId, componentAtlasId),
  });
  await withConsoleErrorHiding(
    () => componentAtlasHandler(req, res),
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

async function restoreDbComponentAtlas(
  componentAtlas: TestComponentAtlas
): Promise<void> {
  await query(
    "UPDATE hat.component_atlases SET component_info=$1, title=$2 WHERE id=$3",
    [
      JSON.stringify({
        cellxgeneDatasetId: null,
        cellxgeneDatasetVersion: null,
      }),
      componentAtlas.title,
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
