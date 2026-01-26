import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { PUBLICATION_STATUS } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { SourceDatasetsSetPublicationStatusData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import publicationStatusHandler from "../pages/api/atlases/[atlasId]/source-datasets/publication-status";
import {
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  SOURCE_DATASET_ATLAS_LINKED_A_BAR,
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  SOURCE_DATASET_ATLAS_LINKED_B_FOO,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_ID_WITH_ARCHIVED_LATEST,
  SOURCE_DATASET_ID_WITH_MULTIPLE_FILES,
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
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("googleapis");
jest.mock("next-auth");

const TEST_ROUTE = "/api/atlases/[atlasId]/source-datasets/publication-status";

const SUCCESSFUL_UPDATED_DATASETS: TestSourceDataset[] = [
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  SOURCE_DATASET_ATLAS_LINKED_A_BAR,
  SOURCE_DATASET_ATLAS_LINKED_B_FOO,
];

const INPUT_DATA_SUCCESSFUL = makeSuccessfulUpdateData(
  PUBLICATION_STATUS.PUBLISHED
);

const INPUT_DATA_NO_DATASETS = {
  publicationStatus: PUBLICATION_STATUS.PUBLISHED,
  sourceDatasetIds: [],
};

const INPUT_DATA_NON_LINKED_DATASET = {
  publicationStatus: PUBLICATION_STATUS.PUBLISHED,
  sourceDatasetIds: [
    SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
    SOURCE_DATASET_ATLAS_LINKED_A_BAR.id,
    SOURCE_DATASET_ATLAS_LINKED_B_FOO.id,
    SOURCE_DATASET_ID_WITH_MULTIPLE_FILES,
  ],
};

const INPUT_DATA_ARCHIVED_DATASET = {
  publicationStatus: PUBLICATION_STATUS.PUBLISHED,
  sourceDatasetIds: [
    SOURCE_DATASET_ID_WITH_MULTIPLE_FILES,
    SOURCE_DATASET_ID_WITH_ARCHIVED_LATEST,
  ],
};

const INPUT_DATA_NONEXISTENT_DATASET = {
  publicationStatus: PUBLICATION_STATUS.PUBLISHED,
  sourceDatasetIds: [
    SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
    SOURCE_DATASET_ATLAS_LINKED_A_BAR.id,
    SOURCE_DATASET_ATLAS_LINKED_B_FOO.id,
    "5321dcb8-7e60-4f79-9587-dd69f9653a93",
  ],
};

const INPUT_DATA_INVALID_STATUS = {
  publicationStatus: "Not a publication status",
  sourceDatasetIds: SUCCESSFUL_UPDATED_DATASETS.map((d) => d.id),
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
        await doPublicationStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_SUCCESSFUL,
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
        await doPublicationStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_SUCCESSFUL,
          undefined,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it("returns error 403 when PATCH requested by unregistered user", async () => {
    expect(
      (
        await doPublicationStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_SUCCESSFUL,
          USER_UNREGISTERED,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it("returns error 403 when PATCH requested by disabled user", async () => {
    expect(
      (
        await doPublicationStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_SUCCESSFUL,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.PATCH,
          false
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      publicationStatusHandler,
      METHOD.PATCH,
      role,
      getQueryValues(ATLAS_WITH_MISC_SOURCE_STUDIES.id),
      INPUT_DATA_SUCCESSFUL,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectSourceDatasetToBeUnchanged(
          SOURCE_DATASET_ATLAS_LINKED_A_FOO
        );
      }
    );
  }

  it("returns error 403 when PATCH requested by user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doPublicationStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_SUCCESSFUL,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.PATCH,
          false
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it("returns error 404 when PATCH requested with nonexistent source dataset", async () => {
    expect(
      (
        await doPublicationStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
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
        await doPublicationStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
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
        await doPublicationStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_NON_LINKED_DATASET,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_FOO);
  });

  it("returns error 404 when PATCH requested with source dataset with archived file", async () => {
    expect(
      (
        await doPublicationStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          INPUT_DATA_ARCHIVED_DATASET,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectSourceDatasetToBeUnchanged(
      SOURCE_DATASET_WITH_MULTIPLE_FILES_W3
    );
    await expectSourceDatasetToBeUnchanged(
      SOURCE_DATASET_WITH_ARCHIVED_LATEST_W2
    );
  });

  it("returns error 400 when PATCH requested with invalid publication status", async () => {
    expect(
      (
        await doPublicationStatusRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          INPUT_DATA_INVALID_STATUS,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it('updates publication statuses to "Published" when PATCH requested by user with INTEGRATION_LEAD role for the atlas', async () => {
    await doSuccessfulPublicationStatusTest(
      USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
      PUBLICATION_STATUS.PUBLISHED
    );
  });

  it('updates publication statuses to "Published" when PATCH requested by user with CONTENT_ADMIN role', async () => {
    await doSuccessfulPublicationStatusTest(
      USER_CONTENT_ADMIN,
      PUBLICATION_STATUS.PUBLISHED
    );
  });

  it('updates publication statuses to "Unpublished" when PATCH requested by user with CONTENT_ADMIN role', async () => {
    await doSuccessfulPublicationStatusTest(
      USER_CONTENT_ADMIN,
      PUBLICATION_STATUS.UNPUBLISHED
    );
  });

  it('updates publication statuses to "Unspecified" when PATCH requested by user with CONTENT_ADMIN role', async () => {
    await doSuccessfulPublicationStatusTest(
      USER_CONTENT_ADMIN,
      PUBLICATION_STATUS.UNSPECIFIED
    );
  });
});

async function doSuccessfulPublicationStatusTest(
  user: TestUser,
  publicationStatus: PUBLICATION_STATUS
): Promise<void> {
  const atlasDatasetsByIdBefore = new Map(
    (
      await getAtlasSourceDatasetsFromDatabase(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id
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
      await doPublicationStatusRequest(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
        makeSuccessfulUpdateData(publicationStatus),
        user
      )
    )._getStatusCode()
  ).toEqual(200);

  const atlasDatasetsByIdAfter = new Map(
    (
      await getAtlasSourceDatasetsFromDatabase(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id
      )
    ).map((d) => [d.id, d])
  );

  const nonUpdatedIds = new Set(atlasDatasetsByIdBefore.keys());

  for (const testDataset of SUCCESSFUL_UPDATED_DATASETS) {
    nonUpdatedIds.delete(testDataset.id);
    const dbDataset = atlasDatasetsByIdAfter.get(testDataset.id);
    if (!expectIsDefined(dbDataset)) return;
    expect(dbDataset.sd_info.publicationStatus).toEqual(publicationStatus);
  }

  for (const datasetId of nonUpdatedIds) {
    expect(atlasDatasetsByIdAfter.get(datasetId)).toEqual(
      atlasDatasetsByIdBefore.get(datasetId)
    );
  }

  for (const testDataset of SUCCESSFUL_UPDATED_DATASETS) {
    await query(
      "UPDATE hat.source_datasets SET sd_info=jsonb_set(sd_info, '{publicationStatus}', to_jsonb($1::text)) WHERE version_id=$2",
      [
        testDataset.publicationStatus ?? PUBLICATION_STATUS.UNSPECIFIED,
        testDataset.versionId,
      ]
    );
  }
}

function makeSuccessfulUpdateData(
  publicationStatus: PUBLICATION_STATUS
): SourceDatasetsSetPublicationStatusData {
  return {
    publicationStatus,
    sourceDatasetIds: SUCCESSFUL_UPDATED_DATASETS.map((d) => d.id),
  };
}

async function doPublicationStatusRequest(
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
    () => publicationStatusHandler(req, res),
    hideConsoleError
  );
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}
