import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerDetailComponentAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { ComponentAtlasEditData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import componentAtlasHandler from "../pages/api/atlases/[atlasId]/component-atlases/[componentAtlasId]";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  COMPONENT_ATLAS_DRAFT_BAR,
  COMPONENT_ATLAS_DRAFT_FOO,
  COMPONENT_ATLAS_ID_WITH_ARCHIVED_LATEST,
  COMPONENT_ATLAS_ID_WITH_MULTIPLE_FILES,
  COMPONENT_ATLAS_MISC_BAR,
  COMPONENT_ATLAS_MISC_BAZ,
  COMPONENT_ATLAS_MISC_FOO,
  COMPONENT_ATLAS_WITH_ARCHIVED_LATEST_W2,
  COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3,
  STAKEHOLDER_ANALOGOUS_ROLES,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import {
  expectDetailApiComponentAtlasToMatchTest,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

const MISC_FOO_EDIT_DATA = {
  capUrl: "https://celltype.info/project/982834/dataset/325453",
} satisfies ComponentAtlasEditData;

const MISC_BAR_EDIT_DATA = {
  capUrl: "https://celltype.info/project/234782/dataset/645632",
} satisfies ComponentAtlasEditData;

const MISC_BAZ_EDIT_DATA = {
  capUrl: "",
} satisfies ComponentAtlasEditData;

const TEST_ROUTE =
  "/api/atlases/[atlasId]/component-atlases/[componentAtlasId]";

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

  it("returns error 405 for DELETE request", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          undefined,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when component atlas is GET requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          undefined,
          METHOD.GET,
          undefined,
          true
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
          USER_UNREGISTERED,
          METHOD.GET,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when component atlas is GET requested from draft atlas by disabled user", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_DISABLED_CONTENT_ADMIN
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
          res._getJSONData() as HCAAtlasTrackerDetailComponentAtlas;
        expectDetailApiComponentAtlasToMatchTest(
          componentAtlas,
          COMPONENT_ATLAS_DRAFT_FOO
        );
        expect(componentAtlas.sourceDatasetCount).toEqual(3);
      }
    );
  }

  it("returns component atlas without metadata when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doComponentAtlasRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_FOO.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlas =
      res._getJSONData() as HCAAtlasTrackerDetailComponentAtlas;
    expectDetailApiComponentAtlasToMatchTest(
      componentAtlas,
      COMPONENT_ATLAS_DRAFT_FOO
    );
    expect(componentAtlas.sourceDatasetCount).toEqual(3);
    expect(componentAtlas.title).toEqual("");
    expect(componentAtlas.cellCount).toEqual(0);
    expect(componentAtlas.assay).toEqual([]);
    expect(componentAtlas.disease).toEqual([]);
    expect(componentAtlas.suspensionType).toEqual([]);
    expect(componentAtlas.tissue).toEqual([]);
  });

  it("returns component atlas with metadata when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doComponentAtlasRequest(
      ATLAS_DRAFT.id,
      COMPONENT_ATLAS_DRAFT_BAR.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlas =
      res._getJSONData() as HCAAtlasTrackerDetailComponentAtlas;
    expectDetailApiComponentAtlasToMatchTest(
      componentAtlas,
      COMPONENT_ATLAS_DRAFT_BAR
    );
    expect(componentAtlas.sourceDatasetCount).toEqual(2);
    expect(componentAtlas.title).not.toEqual("");
    expect(componentAtlas.cellCount).not.toEqual(0);
    expect(componentAtlas.assay).not.toEqual([]);
    expect(componentAtlas.disease).not.toEqual([]);
    expect(componentAtlas.suspensionType).not.toEqual([]);
    expect(componentAtlas.tissue).not.toEqual([]);
  });

  it("returns archived component atlas with metadata when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doComponentAtlasRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      COMPONENT_ATLAS_ID_WITH_ARCHIVED_LATEST,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlas =
      res._getJSONData() as HCAAtlasTrackerDetailComponentAtlas;
    expectDetailApiComponentAtlasToMatchTest(
      componentAtlas,
      COMPONENT_ATLAS_WITH_ARCHIVED_LATEST_W2
    );
    expect(componentAtlas.sourceDatasetCount).toEqual(0);
    expect(componentAtlas.title).not.toEqual("");
    expect(componentAtlas.cellCount).not.toEqual(0);
    expect(componentAtlas.assay).not.toEqual([]);
    expect(componentAtlas.disease).not.toEqual([]);
    expect(componentAtlas.suspensionType).not.toEqual([]);
    expect(componentAtlas.tissue).not.toEqual([]);
  });

  it("returns component atlas with archived source dataset when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doComponentAtlasRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      COMPONENT_ATLAS_ID_WITH_MULTIPLE_FILES,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlas =
      res._getJSONData() as HCAAtlasTrackerDetailComponentAtlas;
    expectDetailApiComponentAtlasToMatchTest(
      componentAtlas,
      COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3
    );
    expect(componentAtlas.sourceDatasetCount).toEqual(1);
    expect(componentAtlas.title).not.toEqual("");
    expect(componentAtlas.cellCount).not.toEqual(0);
    expect(componentAtlas.assay).not.toEqual([]);
    expect(componentAtlas.disease).not.toEqual([]);
    expect(componentAtlas.suspensionType).not.toEqual([]);
    expect(componentAtlas.tissue).not.toEqual([]);
  });

  it("returns error 401 when PATCH requested by logged out user", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          COMPONENT_ATLAS_MISC_FOO.id,
          undefined,
          METHOD.PATCH,
          MISC_FOO_EDIT_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when PATCH requested by unregistered user", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          COMPONENT_ATLAS_MISC_FOO.id,
          USER_UNREGISTERED,
          METHOD.PATCH,
          MISC_FOO_EDIT_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when PATCH requested by disabled user", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          COMPONENT_ATLAS_MISC_FOO.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.PATCH,
          MISC_FOO_EDIT_DATA,
          false
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      componentAtlasHandler,
      METHOD.PATCH,
      role,
      getQueryValues(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
        COMPONENT_ATLAS_MISC_FOO.id
      ),
      MISC_FOO_EDIT_DATA,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
      }
    );
  }

  it("returns error 403 when PATCH requested by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          COMPONENT_ATLAS_MISC_FOO.id,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.PATCH,
          MISC_FOO_EDIT_DATA,
          false
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 404 when PATCH requested with nonexistent component atlas", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          "e6372f4d-ac12-48f3-9158-4c1d8bbc95c6",
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          MISC_FOO_EDIT_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns error 404 when PATCH requested with component atlas the atlas doesn't have", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          MISC_FOO_EDIT_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns error 400 when PATCH requested with component atlas with archived file", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          COMPONENT_ATLAS_ID_WITH_ARCHIVED_LATEST,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          MISC_FOO_EDIT_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when PATCH requested with a non-CAP URL in CAP URL field", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          COMPONENT_ATLAS_MISC_BAR.id,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          {
            ...MISC_BAR_EDIT_DATA,
            capUrl: "https://example.com/not-a-cap-url",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when PATCH requested with a non-dataset CAP URL", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          COMPONENT_ATLAS_MISC_BAR.id,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          {
            ...MISC_BAR_EDIT_DATA,
            capUrl: "https://celltype.info/project/534534",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("updates component atlas when PATCH requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    const res = await doComponentAtlasRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      COMPONENT_ATLAS_MISC_FOO.id,
      USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
      METHOD.PATCH,
      MISC_FOO_EDIT_DATA
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlas =
      res._getJSONData() as HCAAtlasTrackerDetailComponentAtlas;
    expect(componentAtlas.capUrl).toEqual(MISC_FOO_EDIT_DATA.capUrl);
  });

  it("updates component atlas when PATCH requested by user with CONTENT_ADMIN role", async () => {
    const res = await doComponentAtlasRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      COMPONENT_ATLAS_MISC_BAR.id,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      MISC_BAR_EDIT_DATA
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlas =
      res._getJSONData() as HCAAtlasTrackerDetailComponentAtlas;
    expect(componentAtlas.capUrl).toEqual(MISC_BAR_EDIT_DATA.capUrl);
  });

  it("sets CAP URL to null when PATCH requested with empty string CAP URL", async () => {
    const res = await doComponentAtlasRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      COMPONENT_ATLAS_MISC_BAZ.id,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      MISC_BAZ_EDIT_DATA
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlas =
      res._getJSONData() as HCAAtlasTrackerDetailComponentAtlas;
    expect(componentAtlas.capUrl).toBeNull();
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
