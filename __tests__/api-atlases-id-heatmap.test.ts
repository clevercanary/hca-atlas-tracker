import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import heatmapHandler from "../pages/api/atlases/[atlasId]/heatmap";
import {
  ATLAS_NONEXISTENT,
  ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import { withConsoleErrorHiding } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

const TEST_ROUTE = "/api/atlases/[atlasId]/heatmap";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for POST request", async () => {
    expect(
      (
        await doHeatmapRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          USER_CONTENT_ADMIN,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when heatmap is requested by logged out user", async () => {
    expect(
      (
        await doHeatmapRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          undefined,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when heatmap is requested by unregistered user", async () => {
    expect(
      (
        await doHeatmapRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          USER_UNREGISTERED,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when heatmap is requested by disabled user", async () => {
    expect(
      (
        await doHeatmapRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 404 when heatmap is requested from nonexistent atlas", async () => {
    expect(
      (
        await doHeatmapRequest(
          ATLAS_NONEXISTENT.id,
          USER_CONTENT_ADMIN,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });
});

async function doHeatmapRequest(
  atlasId: string,
  user: TestUser | undefined,
  method: METHOD,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId),
  });
  await withConsoleErrorHiding(
    () => heatmapHandler(req, res),
    hideConsoleError
  );
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}
