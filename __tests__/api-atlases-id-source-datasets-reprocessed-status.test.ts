import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { REPROCESSED_STATUS } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { SourceDatasetsSetReprocessedStatusData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import reprocessedStatusHandler from "../pages/api/atlases/[atlasId]/source-datasets/reprocessed-status";
import {
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  ATLAS_WITH_NON_LATEST_METADATA_ENTITIES,
  SOURCE_DATASET_ATLAS_LINKED_A_BAR,
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  SOURCE_DATASET_ATLAS_LINKED_B_FOO,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_BAR,
  SOURCE_DATASET_ID_WITH_ARCHIVED_LATEST,
  SOURCE_DATASET_ID_WITH_MULTIPLE_FILES,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W3,
  SOURCE_DATASET_WITH_ARCHIVED_LATEST_W2,
  SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
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
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("googleapis");
jest.mock("next-auth");

jest.mock("../app/utils/google-sheets-api", () => {
  const googleSheetsApi: typeof import("../app/utils/google-sheets-api") =
    jest.requireActual("../app/utils/google-sheets-api");

  return {
    getSheetTitleForApi: jest.fn(googleSheetsApi.getSheetTitleForApi),
  };
});

const TEST_ROUTE = "/api/atlases/[atlasId]/source-datasets/reprocessed-status";

const SUCCESSFUL_UPDATED_DATASETS: TestSourceDataset[] = [
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  SOURCE_DATASET_ATLAS_LINKED_A_BAR,
  SOURCE_DATASET_ATLAS_LINKED_B_FOO,
];
const INPUT_DATA_SUCCESSFUL = {
  reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
  sourceDatasetIds: SUCCESSFUL_UPDATED_DATASETS.map((d) => d.id),
};

const INPUT_DATA_NO_DATASETS = {
  reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
  sourceDatasetIds: [],
};

const INPUT_DATA_NON_LINKED_DATASET = {
  reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
  sourceDatasetIds: [
    SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
    SOURCE_DATASET_ATLAS_LINKED_A_BAR.id,
    SOURCE_DATASET_ATLAS_LINKED_B_FOO.id,
    SOURCE_DATASET_ID_WITH_MULTIPLE_FILES,
  ],
};

const INPUT_DATA_ARCHIVED_DATASET = {
  reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
  sourceDatasetIds: [
    SOURCE_DATASET_ID_WITH_MULTIPLE_FILES,
    SOURCE_DATASET_ID_WITH_ARCHIVED_LATEST,
  ],
};

const INPUT_DATA_NONEXISTENT_DATASET = {
  reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
  sourceDatasetIds: [
    SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
    SOURCE_DATASET_ATLAS_LINKED_A_BAR.id,
    SOURCE_DATASET_ATLAS_LINKED_B_FOO.id,
    "5321dcb8-7e60-4f79-9587-dd69f9653a93",
  ],
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
        await doReprocessedStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_SUCCESSFUL,
          undefined,
          METHOD.PUT,
        )
      )._getStatusCode(),
    ).toEqual(405);
  });
});

describe(`${TEST_ROUTE} (PATCH)`, () => {
  it("returns error 401 when PATCH requested by logged out user", async () => {
    expect(
      (
        await doReprocessedStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_SUCCESSFUL,
          undefined,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(401);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it("returns error 403 when PATCH requested by unregistered user", async () => {
    expect(
      (
        await doReprocessedStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_SUCCESSFUL,
          USER_UNREGISTERED,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it("returns error 403 when PATCH requested by disabled user", async () => {
    expect(
      (
        await doReprocessedStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_SUCCESSFUL,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.PATCH,
          false,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      reprocessedStatusHandler,
      METHOD.PATCH,
      role,
      getQueryValues(ATLAS_WITH_MISC_SOURCE_STUDIES.id),
      INPUT_DATA_SUCCESSFUL,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectSourceDatasetToBeUnchanged(
          SOURCE_DATASET_ATLAS_LINKED_A_FOO,
        );
      },
    );
  }

  it("returns error 403 when PATCH requested by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doReprocessedStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_SUCCESSFUL,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.PATCH,
          false,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it("returns error 404 when PATCH requested with nonexistent source dataset", async () => {
    expect(
      (
        await doReprocessedStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_NONEXISTENT_DATASET,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
  });

  it("returns error 400 when PATCH requested with empty source datasets list", async () => {
    expect(
      (
        await doReprocessedStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_NO_DATASETS,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
  });

  it("returns error 404 when PATCH requested with source dataset the atlas doesn't have", async () => {
    expect(
      (
        await doReprocessedStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_NON_LINKED_DATASET,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  it("returns error 400 when PATCH requested with source dataset with archived file", async () => {
    expect(
      (
        await doReprocessedStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          INPUT_DATA_ARCHIVED_DATASET,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
    await expectSourceDatasetToBeUnchanged(
      SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
    );
    await expectSourceDatasetToBeUnchanged(
      SOURCE_DATASET_WITH_ARCHIVED_LATEST_W2,
    );
  });

  it("returns error 400 when PATCH requested with source dataset with non-latest version linked to the atlas", async () => {
    const inputData = {
      reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
      sourceDatasetIds: [SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_BAR],
    } satisfies SourceDatasetsSetReprocessedStatusData;
    expect(
      (
        await doReprocessedStatusRequest(
          ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
          inputData,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
    await expectSourceDatasetToBeUnchanged(
      SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2,
    );
    await expectSourceDatasetToBeUnchanged(
      SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W3,
    );
  });

  it("updates reprocessed statuses when PATCH requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    await doSuccessfulReprocessedStatusTest(
      USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
    );
  });

  it("updates reprocessed statuses when PATCH requested by user with CONTENT_ADMIN role", async () => {
    await doSuccessfulReprocessedStatusTest(USER_CONTENT_ADMIN);
  });
});

async function doSuccessfulReprocessedStatusTest(
  user: TestUser,
): Promise<void> {
  const atlasDatasetsByIdBefore = new Map(
    (
      await getAtlasSourceDatasetsFromDatabase(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      )
    ).map((d) => [d.id, d]),
  );

  for (const testDataset of SUCCESSFUL_UPDATED_DATASETS) {
    const dbDataset = atlasDatasetsByIdBefore.get(testDataset.id);
    if (!expectIsDefined(dbDataset)) return;
    expectDbSourceDatasetToMatchTest(dbDataset, testDataset);
  }

  expect(
    (
      await doReprocessedStatusRequest(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
        INPUT_DATA_SUCCESSFUL,
        user,
      )
    )._getStatusCode(),
  ).toEqual(200);

  const atlasDatasetsByIdAfter = new Map(
    (
      await getAtlasSourceDatasetsFromDatabase(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      )
    ).map((d) => [d.id, d]),
  );

  const nonUpdatedIds = new Set(atlasDatasetsByIdBefore.keys());

  for (const testDataset of SUCCESSFUL_UPDATED_DATASETS) {
    nonUpdatedIds.delete(testDataset.id);
    const dbDataset = atlasDatasetsByIdAfter.get(testDataset.id);
    if (!expectIsDefined(dbDataset)) return;
    expect(dbDataset.reprocessed_status).toEqual(REPROCESSED_STATUS.ORIGINAL);
  }

  for (const datasetId of nonUpdatedIds) {
    expect(atlasDatasetsByIdAfter.get(datasetId)).toEqual(
      atlasDatasetsByIdBefore.get(datasetId),
    );
  }

  for (const testDataset of SUCCESSFUL_UPDATED_DATASETS) {
    await query(
      "UPDATE hat.source_datasets SET reprocessed_status=$1 WHERE version_id=$2",
      [
        testDataset.reprocessedStatus ?? REPROCESSED_STATUS.UNSPECIFIED,
        testDataset.versionId,
      ],
    );
  }
}

async function doReprocessedStatusRequest(
  atlasId: string,
  body: Record<string, unknown>,
  user?: TestUser,
  method = METHOD.PATCH,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body,
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId),
  });
  await withConsoleErrorHiding(
    () => reprocessedStatusHandler(req, res),
    hideConsoleError,
  );
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}
