import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerValidationRecord } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import tasksHandler from "../pages/api/tasks";
import {
  INITIAL_TEST_ATLASES_BY_SOURCE_DATASET,
  INITIAL_TEST_SOURCE_DATASETS,
  TEST_HCA_PROJECTS_BY_DOI,
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";

jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe("/api/tasks", () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (await doTasksRequest(USER_STAKEHOLDER, METHOD.POST))._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect((await doTasksRequest())._getStatusCode()).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect((await doTasksRequest(USER_UNREGISTERED))._getStatusCode()).toEqual(
      403
    );
  });

  it("returns validations for user with STAKEHOLDER role", async () => {
    const res = await doTasksRequest(USER_STAKEHOLDER);
    expect(res._getStatusCode()).toEqual(200);
    expectInitialValidationsToExist(res._getJSONData());
  });

  it("returns validations for user with CONTENT_ADMIN role", async () => {
    const res = await doTasksRequest(USER_CONTENT_ADMIN);
    expect(res._getStatusCode()).toEqual(200);
    expectInitialValidationsToExist(res._getJSONData());
  });
});

async function doTasksRequest(
  user?: TestUser,
  method = METHOD.GET
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await tasksHandler(req, res);
  return res;
}

function expectInitialValidationsToExist(
  validations: HCAAtlasTrackerValidationRecord[]
): void {
  for (const testDataset of INITIAL_TEST_SOURCE_DATASETS) {
    const datasetValidations = validations.filter(
      (v) => v.entityId === testDataset.id
    );
    const hasHca =
      "doi" in testDataset &&
      testDataset.doi !== null &&
      TEST_HCA_PROJECTS_BY_DOI.has(testDataset.doi);
    expect(datasetValidations).toHaveLength(hasHca ? 4 : 2);
    const datasetAtlases =
      INITIAL_TEST_ATLASES_BY_SOURCE_DATASET[testDataset.id];
    const { atlasNames } = datasetValidations[0];
    expect(atlasNames).toHaveLength(datasetAtlases.length);
    for (const atlas of datasetAtlases) {
      expect(atlasNames).toContain(`${atlas.shortName} v${atlas.version}`);
    }
  }
}
