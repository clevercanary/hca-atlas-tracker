import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { SourceDatasetsSetSourceStudyData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import sourceStudyHandler from "../pages/api/atlases/[atlasId]/source-datasets/source-study";
import {
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_WITH_SOURCE_STUDY_BAR,
  SOURCE_DATASET_WITH_SOURCE_STUDY_FOO,
  SOURCE_DATASET_WITHOUT_SOURCE_STUDY_BAR,
  SOURCE_DATASET_WITHOUT_SOURCE_STUDY_FOO,
  SOURCE_STUDY_MISC_B_BAR,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES_B,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  expectSourceDatasetToBeUnchanged,
  getAtlasSourceDatasetsFromDatabase,
  resetDatabase,
} from "../testing/db-utils";
import { TestSourceDataset, TestUser } from "../testing/entities";
import {
  expectDbSourceDatasetToMatchTest,
  expectIsDefined,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("googleapis");
jest.mock("next-auth");

const TEST_ROUTE = "/api/atlases/[atlasId]/source-datasets/source-study";

const SUCCESSFUL_UPDATED_DATASETS: TestSourceDataset[] = [
  SOURCE_DATASET_WITH_SOURCE_STUDY_FOO,
  SOURCE_DATASET_WITH_SOURCE_STUDY_BAR,
  SOURCE_DATASET_WITHOUT_SOURCE_STUDY_FOO,
  SOURCE_DATASET_WITHOUT_SOURCE_STUDY_BAR,
];
const INPUT_DATA_NULL_SUCCESSFUL = makeSuccessfulInputData(null);

const INPUT_DATA_NO_DATASETS = {
  sourceDatasetIds: [],
  sourceStudyId: null,
};

const INPUT_DATA_NON_LINKED_DATASET = {
  sourceDatasetIds: [
    ...INPUT_DATA_NULL_SUCCESSFUL.sourceDatasetIds,
    SOURCE_DATASET_FOO.id,
  ],
  sourceStudyId: null,
};

const INPUT_DATA_NONEXISTENT_DATASET = {
  sourceDatasetIds: [
    ...INPUT_DATA_NULL_SUCCESSFUL.sourceDatasetIds,
    "15a70a1c-4e24-40d9-8df2-c6c3d06a1af8",
  ],
  sourceStudyId: null,
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe(`${TEST_ROUTE} (misc)`, () => {
  it("returns error 405 for PUT request", async () => {
    expect(
      (
        await doSourceStudyRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          INPUT_DATA_NULL_SUCCESSFUL,
          undefined,
          METHOD.PUT
        )
      )._getStatusCode()
    ).toEqual(405);
  });
});

describe(`${TEST_ROUTE} (PATCH)`, () => {
  it("returns error 401 when PATCH requested by logged out user", async () => {
    expect(
      (
        await doSourceStudyRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          INPUT_DATA_NULL_SUCCESSFUL,
          undefined,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectSourceDatasetToBeUnchanged(
      SOURCE_DATASET_WITH_SOURCE_STUDY_FOO
    );
  });

  it("returns error 403 when PATCH requested by unregistered user", async () => {
    expect(
      (
        await doSourceStudyRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          INPUT_DATA_NULL_SUCCESSFUL,
          USER_UNREGISTERED,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(
      SOURCE_DATASET_WITH_SOURCE_STUDY_FOO
    );
  });

  it("returns error 403 when PATCH requested by disabled user", async () => {
    expect(
      (
        await doSourceStudyRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          INPUT_DATA_NULL_SUCCESSFUL,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.PATCH,
          false
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(
      SOURCE_DATASET_WITH_SOURCE_STUDY_FOO
    );
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      sourceStudyHandler,
      METHOD.PATCH,
      role,
      getQueryValues(ATLAS_WITH_MISC_SOURCE_STUDIES_B.id),
      INPUT_DATA_NULL_SUCCESSFUL,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectSourceDatasetToBeUnchanged(
          SOURCE_DATASET_WITH_SOURCE_STUDY_FOO
        );
      }
    );
  }

  it("returns error 403 when PATCH requested by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doSourceStudyRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          INPUT_DATA_NULL_SUCCESSFUL,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.PATCH,
          false
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(
      SOURCE_DATASET_WITH_SOURCE_STUDY_FOO
    );
  });

  it("returns error 404 when PATCH requested with nonexistent source dataset", async () => {
    expect(
      (
        await doSourceStudyRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          INPUT_DATA_NONEXISTENT_DATASET,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns error 400 when PATCH requested with empty source datasets list", async () => {
    expect(
      (
        await doSourceStudyRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          INPUT_DATA_NO_DATASETS,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 404 when PATCH requested with source dataset the atlas doesn't have", async () => {
    expect(
      (
        await doSourceStudyRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          INPUT_DATA_NON_LINKED_DATASET,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectSourceDatasetToBeUnchanged(
      SOURCE_DATASET_WITH_SOURCE_STUDY_FOO
    );
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  it("links source study when PATCH requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    await doSuccessfulSourceStudyTest(
      USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES_B,
      SOURCE_STUDY_MISC_B_BAR.id
    );
  });

  it("links source study when PATCH requested by user with CONTENT_ADMIN role", async () => {
    await doSuccessfulSourceStudyTest(
      USER_CONTENT_ADMIN,
      SOURCE_STUDY_MISC_B_BAR.id
    );
  });

  it("unlinks source studies when PATCH requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    await doSuccessfulSourceStudyTest(
      USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES_B,
      null
    );
  });

  it("unlinks source studies when PATCH requested by user with CONTENT_ADMIN role", async () => {
    await doSuccessfulSourceStudyTest(USER_CONTENT_ADMIN, null);
  });
});

async function doSuccessfulSourceStudyTest(
  user: TestUser,
  sourceStudyId: string | null
): Promise<void> {
  const atlasDatasetsByIdBefore = new Map(
    (
      await getAtlasSourceDatasetsFromDatabase(
        ATLAS_WITH_MISC_SOURCE_STUDIES_B.id
      )
    ).map((d) => [d.id, d])
  );

  for (const testDataset of SUCCESSFUL_UPDATED_DATASETS) {
    const dbDataset = atlasDatasetsByIdBefore.get(testDataset.id);
    if (!expectIsDefined(dbDataset)) return;
    expectDbSourceDatasetToMatchTest(dbDataset, testDataset);
  }

  expect(
    (
      await doSourceStudyRequest(
        ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
        makeSuccessfulInputData(sourceStudyId),
        user
      )
    )._getStatusCode()
  ).toEqual(200);

  const atlasDatasetsByIdAfter = new Map(
    (
      await getAtlasSourceDatasetsFromDatabase(
        ATLAS_WITH_MISC_SOURCE_STUDIES_B.id
      )
    ).map((d) => [d.id, d])
  );

  const nonUpdatedIds = new Set(atlasDatasetsByIdBefore.keys());

  for (const testDataset of SUCCESSFUL_UPDATED_DATASETS) {
    nonUpdatedIds.delete(testDataset.id);
    const dbDataset = atlasDatasetsByIdAfter.get(testDataset.id);
    if (!expectIsDefined(dbDataset)) return;
    expect(dbDataset.source_study_id).toEqual(sourceStudyId);
  }

  for (const datasetId of nonUpdatedIds) {
    expect(atlasDatasetsByIdAfter.get(datasetId)).toEqual(
      atlasDatasetsByIdBefore.get(datasetId)
    );
  }

  for (const testDataset of SUCCESSFUL_UPDATED_DATASETS) {
    await query(
      "UPDATE hat.source_datasets SET source_study_id=$1 WHERE id=$2",
      [testDataset.sourceStudyId ?? null, testDataset.id]
    );
  }
}

function makeSuccessfulInputData(
  sourceStudyId: string | null
): SourceDatasetsSetSourceStudyData {
  return {
    sourceDatasetIds: SUCCESSFUL_UPDATED_DATASETS.map((d) => d.id),
    sourceStudyId,
  };
}

async function doSourceStudyRequest(
  atlasId: string,
  body: Record<string, unknown>,
  user?: TestUser,
  method = METHOD.PATCH,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body,
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId),
  });
  await withConsoleErrorHiding(
    () => sourceStudyHandler(req, res),
    hideConsoleError
  );
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}
