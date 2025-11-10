import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerDetailComponentAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import componentAtlasHandler from "../pages/api/atlases/[atlasId]/component-atlases/[componentAtlasId]";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  COMPONENT_ATLAS_DRAFT_BAR,
  COMPONENT_ATLAS_DRAFT_FOO,
  COMPONENT_ATLAS_WITH_ARCHIVED_LATEST,
  COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
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

  it("returns error 405 for PATCH request", async () => {
    expect(
      (
        await doComponentAtlasRequest(
          ATLAS_DRAFT.id,
          COMPONENT_ATLAS_DRAFT_FOO.id,
          undefined,
          METHOD.PATCH
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
      COMPONENT_ATLAS_WITH_ARCHIVED_LATEST.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlas =
      res._getJSONData() as HCAAtlasTrackerDetailComponentAtlas;
    expectDetailApiComponentAtlasToMatchTest(
      componentAtlas,
      COMPONENT_ATLAS_WITH_ARCHIVED_LATEST
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
      COMPONENT_ATLAS_WITH_MULTIPLE_FILES.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const componentAtlas =
      res._getJSONData() as HCAAtlasTrackerDetailComponentAtlas;
    expectDetailApiComponentAtlasToMatchTest(
      componentAtlas,
      COMPONENT_ATLAS_WITH_MULTIPLE_FILES
    );
    expect(componentAtlas.sourceDatasetCount).toEqual(1);
    expect(componentAtlas.title).not.toEqual("");
    expect(componentAtlas.cellCount).not.toEqual(0);
    expect(componentAtlas.assay).not.toEqual([]);
    expect(componentAtlas.disease).not.toEqual([]);
    expect(componentAtlas.suspensionType).not.toEqual([]);
    expect(componentAtlas.tissue).not.toEqual([]);
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
