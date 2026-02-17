import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { ProjectsResponse } from "../app/apis/azul/hca-dcp/common/responses";
import { HCAAtlasTrackerValidationRecord } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import tasksHandler from "../pages/api/tasks";
import {
  INITIAL_TEST_ATLASES_BY_SOURCE_STUDY,
  INITIAL_TEST_SOURCE_STUDIES,
  STAKEHOLDER_ANALOGOUS_ROLES,
  TEST_CELLXGENE_COLLECTIONS_BY_DOI,
  TEST_HCA_PROJECTS_BY_DOI,
  TEST_HCA_PROJECTS_BY_ID,
  TEST_HCA_PROJECTS_WITH_UNAVAILABLE_SERVICE,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestSourceStudy, TestUser } from "../testing/entities";
import { testApiRole, withConsoleErrorHiding } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");

jest.mock("next-auth");

const TEST_ROUTE = "/api/tasks";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (await doTasksRequest(USER_STAKEHOLDER, METHOD.POST))._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (await doTasksRequest(undefined, METHOD.GET, true))._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doTasksRequest(USER_UNREGISTERED, METHOD.GET, true)
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 for disabled user", async () => {
    expect(
      (await doTasksRequest(USER_DISABLED_CONTENT_ADMIN))._getStatusCode(),
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns validations",
      TEST_ROUTE,
      tasksHandler,
      METHOD.GET,
      role,
      undefined,
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        expectInitialValidationsToExist(res._getJSONData());
      },
    );
  }

  it("returns validations for user with CONTENT_ADMIN role", async () => {
    const res = await doTasksRequest(USER_CONTENT_ADMIN);
    expect(res._getStatusCode()).toEqual(200);
    expectInitialValidationsToExist(res._getJSONData());
  });
});

async function doTasksRequest(
  user?: TestUser,
  method = METHOD.GET,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(() => tasksHandler(req, res), hideConsoleError);
  return res;
}

function expectInitialValidationsToExist(
  validations: HCAAtlasTrackerValidationRecord[],
): void {
  for (const testStudy of INITIAL_TEST_SOURCE_STUDIES) {
    const studyValidations = validations.filter(
      (v) => v.entityId === testStudy.id,
    );
    let expectedValidationCount = 3;
    if (hasAvailableHcaId(testStudy)) {
      expectedValidationCount += 2;
      if ("doi" in testStudy && testStudy.doi !== null)
        expectedValidationCount++;
    }
    if (hasCellxGeneId(testStudy)) {
      expectedValidationCount += 1;
    }
    expect(studyValidations).toHaveLength(expectedValidationCount);
    const studyAtlases = INITIAL_TEST_ATLASES_BY_SOURCE_STUDY[testStudy.id];
    const { atlasNames } = studyValidations[0];
    expect(atlasNames).toHaveLength(studyAtlases.length);
    for (const atlas of studyAtlases) {
      expect(atlasNames).toContain(
        `${atlas.shortName} v${atlas.generation}.${atlas.revision}`,
      );
    }
  }
}

function hasAvailableHcaId(testStudy: TestSourceStudy): boolean {
  let testProject: ProjectsResponse | null;
  let hasId: boolean;
  if ("doi" in testStudy && testStudy.hcaProjectId === undefined) {
    testProject =
      testStudy.doi === null
        ? null
        : (TEST_HCA_PROJECTS_BY_DOI.get(testStudy.doi) ?? null);
    hasId = testProject !== null;
  } else {
    const id = testStudy.hcaProjectId;
    if (id === null) {
      testProject = null;
      hasId = false;
    } else {
      testProject = id ? (TEST_HCA_PROJECTS_BY_ID.get(id) ?? null) : null;
      hasId = true;
    }
  }
  return (
    hasId &&
    (testProject === null ||
      !TEST_HCA_PROJECTS_WITH_UNAVAILABLE_SERVICE.includes(testProject))
  );
}

function hasCellxGeneId(testStudy: TestSourceStudy): boolean {
  return "doi" in testStudy && testStudy.cellxgeneCollectionId === undefined
    ? testStudy.doi !== null &&
        TEST_CELLXGENE_COLLECTIONS_BY_DOI.has(testStudy.doi)
    : testStudy.cellxgeneCollectionId !== null;
}
