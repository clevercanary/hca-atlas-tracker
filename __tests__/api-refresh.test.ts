import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { ProjectsResponse } from "../app/apis/azul/hca-dcp/common/responses";
import { METHOD } from "../app/common/entities";
import {
  RefreshServicesStatuses,
  REFRESH_ACTIVITY,
  REFRESH_OUTCOME,
} from "../app/services/common/entities";
import { endPgPool } from "../app/services/database";
import { Handler } from "../app/utils/api-handler";
import {
  HCA_CATALOG_TEST1,
  STAKEHOLDER_ANALOGOUS_ROLES,
  TEST_CELLXGENE_COLLECTIONS_A,
  TEST_HCA_CATALOGS,
  USER_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { TestUser } from "../testing/entities";
import { delay, testApiRole, withConsoleErrorHiding } from "../testing/utils";

jest.mock("../app/services/component-atlases");
jest.mock("../app/services/user-profile");
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/services/source-studies", () => ({
  updateSourceStudyExternalIds: jest.fn(),
}));
jest.mock("../app/services/source-datasets", () => ({
  updateCellxGeneSourceDatasets: jest.fn(),
}));

const refreshValidations = jest.fn();
jest.mock("../app/services/validations", () => ({
  refreshValidations,
}));

const getCellxGeneCollections = jest.fn(
  async () => TEST_CELLXGENE_COLLECTIONS_A
);
jest.mock("../app/utils/cellxgene-api", () => ({
  getCellxGeneCollections,
  getCellxGeneDatasets: jest.fn().mockResolvedValue([]),
}));

const getLatestCatalog = jest.fn(async () => HCA_CATALOG_TEST1);
jest.mock("../app/utils/hca-api", () => ({
  getAllProjects: async (catalog: string): Promise<ProjectsResponse[]> =>
    TEST_HCA_CATALOGS[catalog],
  getLatestCatalog,
}));

jest.useFakeTimers({
  advanceTimers: true,
  doNotFake: ["setTimeout"],
});

const TEST_ROUTE = "/api/refresh";

let consoleLogSpy: jest.SpyInstance;
let refreshHandler: Handler;

beforeAll(async () => {
  consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  refreshHandler = (await import("../pages/api/refresh")).default;
  await delay();
});

afterAll(() => {
  endPgPool();
  consoleLogSpy.mockRestore();
  globalThis.hcaAtlasTrackerProjectsInfoCache = undefined;
  globalThis.hcaAtlasTrackerCellxGeneInfoCache = undefined;
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for PATCH request", async () => {
    expect(
      (await doRefreshTest(undefined, METHOD.PATCH))._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when GET requested by logged out user", async () => {
    expect(
      (await doRefreshTest(undefined, METHOD.GET))._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when GET requested by unregistered user", async () => {
    expect(
      (await doRefreshTest(USER_UNREGISTERED, METHOD.GET))._getStatusCode()
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      (...args) => refreshHandler(...args),
      METHOD.GET,
      role,
      undefined,
      undefined,
      false,
      (res) => expect(res._getStatusCode()).toEqual(403)
    );
  }

  it("returns refresh status when GET requested by user with CONTENT_ADMIN role", async () => {
    const res = await doRefreshTest(USER_CONTENT_ADMIN, METHOD.GET);
    expect(res._getStatusCode()).toEqual(200);
    const refreshStatus = res._getJSONData() as RefreshServicesStatuses;
    expect(refreshStatus.cellxgene.currentActivity).toEqual(
      REFRESH_ACTIVITY.NOT_REFRESHING
    );
    expect(refreshStatus.cellxgene.errorMessage).toBeNull();
    expect(refreshStatus.cellxgene.previousOutcome).toEqual(
      REFRESH_OUTCOME.COMPLETED
    );
    expect(refreshStatus.hca.currentActivity).toEqual(
      REFRESH_ACTIVITY.NOT_REFRESHING
    );
    expect(refreshStatus.hca.errorMessage).toBeNull();
    expect(refreshStatus.hca.previousOutcome).toEqual(
      REFRESH_OUTCOME.COMPLETED
    );
  });

  it("returns error 401 when POST requested by logged out user", async () => {
    expect(
      (await doRefreshTest(undefined, METHOD.POST))._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when POST requested by unregistered user", async () => {
    expect(
      (await doRefreshTest(USER_UNREGISTERED, METHOD.POST))._getStatusCode()
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      (...args) => refreshHandler(...args),
      METHOD.POST,
      role,
      undefined,
      undefined,
      false,
      (res) => expect(res._getStatusCode()).toEqual(403)
    );
  }

  it("does refresh and updates validations when POST requested by user with CONTENT_ADMIN role", async () => {
    expect(refreshValidations).toHaveBeenCalledTimes(1);
    expect(getLatestCatalog).toHaveBeenCalledTimes(1);
    expect(getCellxGeneCollections).toHaveBeenCalledTimes(1);
    jest.setSystemTime(jest.now() + 14400001);
    expect(
      (await doRefreshTest(USER_CONTENT_ADMIN, METHOD.POST))._getStatusCode()
    ).toEqual(202);
    await delay();
    expect(refreshValidations).toHaveBeenCalledTimes(2);
    expect(getLatestCatalog).toHaveBeenCalledTimes(2);
    expect(getCellxGeneCollections).toHaveBeenCalledTimes(2);
  });
});

async function doRefreshTest(
  user: TestUser | undefined,
  method: METHOD,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(
    () => refreshHandler(req, res),
    hideConsoleError
  );
  return res;
}
