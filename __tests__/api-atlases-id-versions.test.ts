import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import versionsHandler from "../pages/api/atlases/[atlasId]/versions";
import {
  ATLAS_PUBLISHED,
  ATLAS_PUBLISHED_R6,
  ATLAS_WITH_DRAFT_LATEST_R0,
  ATLAS_WITH_DRAFT_LATEST_R1,
  SOURCE_STUDY_PUBLISHED,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  getExistingAtlasFromDatabase,
  getValidationsByEntityId,
  resetDatabase,
} from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import {
  assertExpectDefined,
  delay,
  expectApiAtlasToMatchTestWithoutRevision,
  expectDbAtlasToMatchApi,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("googleapis");
jest.mock("next-auth");

const TEST_ROUTE = "/api/atlases/[id]/versions";

const ATLAS_ID_NONEXISTENT = "f643a5ff-0803-4bf1-b650-184161220bc2";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for GET request", async () => {
    expect(
      (
        await doVersionsRequest(
          ATLAS_PUBLISHED.id,
          USER_CONTENT_ADMIN,
          false,
          METHOD.GET,
        )
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 when requested by logged out user", async () => {
    expect(
      (
        await doVersionsRequest(ATLAS_PUBLISHED.id, undefined, true)
      )._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 when requested by unregistered user", async () => {
    expect(
      (
        await doVersionsRequest(ATLAS_PUBLISHED.id, USER_UNREGISTERED, true)
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 when requested by disabled user", async () => {
    expect(
      (
        await doVersionsRequest(ATLAS_PUBLISHED.id, USER_DISABLED_CONTENT_ADMIN)
      )._getStatusCode(),
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      versionsHandler,
      METHOD.POST,
      role,
      getQueryValues(ATLAS_PUBLISHED.id),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(403);
      },
    );
  }

  it("returns error 404 when nonexistent atlas is requested", async () => {
    expect(
      (
        await doVersionsRequest(ATLAS_ID_NONEXISTENT, USER_CONTENT_ADMIN, true)
      )._getStatusCode(),
    ).toEqual(404);
  });

  it("returns error 400 when non-latest atlas with published latest is requested", async () => {
    expect(
      (
        await doVersionsRequest(ATLAS_PUBLISHED_R6.id, USER_CONTENT_ADMIN, true)
      )._getStatusCode(),
    ).toEqual(400);
  });

  it("returns error 400 when non-latest atlas with draft latest is requested", async () => {
    expect(
      (
        await doVersionsRequest(
          ATLAS_WITH_DRAFT_LATEST_R0.id,
          USER_CONTENT_ADMIN,
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
  });

  it("returns error 400 when draft atlas is requested", async () => {
    expect(
      (
        await doVersionsRequest(
          ATLAS_WITH_DRAFT_LATEST_R1.id,
          USER_CONTENT_ADMIN,
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
  });

  it("creates new revision of published atlas, copying fields and updating linked entities as appropriate", async () => {
    const validationsBefore = await getValidationsByEntityId(
      SOURCE_STUDY_PUBLISHED.id,
    );

    await delay(10); // Add a delay to ensure different timestamps

    const res = await doVersionsRequest(ATLAS_PUBLISHED.id, USER_CONTENT_ADMIN);
    expect(res._getStatusCode()).toEqual(201);

    const newAtlas = res._getJSONData() as HCAAtlasTrackerAtlas;

    expect(newAtlas.id).not.toEqual(ATLAS_PUBLISHED.id);
    expect(newAtlas.revision).toEqual(ATLAS_PUBLISHED.revision + 1);
    expect(newAtlas.publishedAt).toBeNull();
    expect(newAtlas.isLatest).toEqual(true);
    expectApiAtlasToMatchTestWithoutRevision(newAtlas, ATLAS_PUBLISHED);
    expectDbAtlasToMatchApi(
      await getExistingAtlasFromDatabase(newAtlas.id),
      newAtlas,
      1,
    );

    const validationsAfter = await getValidationsByEntityId(
      SOURCE_STUDY_PUBLISHED.id,
    );

    expect(validationsAfter).toHaveLength(validationsBefore.length);

    for (const validationAfter of validationsAfter) {
      const validationBefore = validationsBefore.find(
        (v) => v.id === validationAfter.id,
      );
      assertExpectDefined(validationBefore);
      expect(validationAfter.updated_at.getTime()).toBeGreaterThan(
        validationBefore.updated_at.getTime(),
      );
      expect(validationAfter.atlas_ids).toContain(ATLAS_PUBLISHED.id);
      expect(validationAfter.atlas_ids).toContain(newAtlas.id);
    }
  });
});

async function doVersionsRequest(
  atlasId: string,
  user?: TestUser,
  hideConsoleError = false,
  method = METHOD.POST,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId),
  });
  await withConsoleErrorHiding(
    () => versionsHandler(req, res),
    hideConsoleError,
  );
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}
