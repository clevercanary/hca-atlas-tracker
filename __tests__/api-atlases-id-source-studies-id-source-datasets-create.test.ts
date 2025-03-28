import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { dbSourceDatasetToApiSourceDataset } from "../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import {
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetWithStudyProperties,
  HCAAtlasTrackerSourceDataset,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { NewSourceDatasetData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import { getSourceDataset } from "../app/services/source-datasets";
import createHandler from "../pages/api/atlases/[atlasId]/source-studies/[sourceStudyId]/source-datasets/create";
import {
  ATLAS_DRAFT,
  ATLAS_NONEXISTENT,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  SOURCE_STUDY_DRAFT_OK,
  SOURCE_STUDY_WITH_SOURCE_DATASETS,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestAtlas, TestSourceStudy, TestUser } from "../testing/entities";
import { testApiRole, withConsoleErrorHiding } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

const TEST_ROUTE =
  "/api/atlases/[atlasId]/source-studies/[sourceStudyId]/source-datasets/create";

const NEW_SOURCE_DATASET_DATA: NewSourceDatasetData = {
  title: "New Source Dataset",
};

const NEW_SOURCE_DATASET_DATA_FOO: NewSourceDatasetData = {
  title: "New Source Dataset Foo",
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for non-POST request", async () => {
    expect(
      (
        await doCreateTest(
          undefined,
          ATLAS_WITH_MISC_SOURCE_STUDIES,
          SOURCE_STUDY_WITH_SOURCE_DATASETS,
          NEW_SOURCE_DATASET_DATA,
          false,
          METHOD.GET
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (
        await doCreateTest(
          undefined,
          ATLAS_WITH_MISC_SOURCE_STUDIES,
          SOURCE_STUDY_WITH_SOURCE_DATASETS,
          NEW_SOURCE_DATASET_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCreateTest(
          USER_UNREGISTERED,
          ATLAS_WITH_MISC_SOURCE_STUDIES,
          SOURCE_STUDY_WITH_SOURCE_DATASETS,
          NEW_SOURCE_DATASET_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 for disabled user", async () => {
    expect(
      (
        await doCreateTest(
          USER_DISABLED_CONTENT_ADMIN,
          ATLAS_WITH_MISC_SOURCE_STUDIES,
          SOURCE_STUDY_WITH_SOURCE_DATASETS,
          NEW_SOURCE_DATASET_DATA
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      createHandler,
      METHOD.POST,
      role,
      getQueryValues(
        ATLAS_WITH_MISC_SOURCE_STUDIES,
        SOURCE_STUDY_WITH_SOURCE_DATASETS
      ),
      NEW_SOURCE_DATASET_DATA,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(403);
      }
    );
  }

  it("returns error 403 for logged in user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doCreateTest(
          USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
          ATLAS_DRAFT,
          SOURCE_STUDY_DRAFT_OK,
          NEW_SOURCE_DATASET_DATA
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 404 when specified atlas doesn't exist", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_NONEXISTENT,
          SOURCE_STUDY_WITH_SOURCE_DATASETS,
          NEW_SOURCE_DATASET_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns error 400 when title is not a string", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_WITH_MISC_SOURCE_STUDIES,
          SOURCE_STUDY_WITH_SOURCE_DATASETS,
          {
            ...NEW_SOURCE_DATASET_DATA,
            title: 123,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when title is empty string", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_WITH_MISC_SOURCE_STUDIES,
          SOURCE_STUDY_WITH_SOURCE_DATASETS,
          {
            ...NEW_SOURCE_DATASET_DATA,
            title: "",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates and returns source dataset entry when requested by user with CONTENT_ADMIN role", async () => {
    await testSuccessfulCreate(
      ATLAS_WITH_MISC_SOURCE_STUDIES,
      SOURCE_STUDY_WITH_SOURCE_DATASETS,
      NEW_SOURCE_DATASET_DATA,
      NEW_SOURCE_DATASET_DATA.title
    );
  });

  it("creates and returns source dataset entry when requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    await testSuccessfulCreate(
      ATLAS_WITH_MISC_SOURCE_STUDIES,
      SOURCE_STUDY_WITH_SOURCE_DATASETS,
      NEW_SOURCE_DATASET_DATA_FOO,
      NEW_SOURCE_DATASET_DATA_FOO.title,
      USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES
    );
  });
});

async function testSuccessfulCreate(
  atlas: TestAtlas,
  sourceStudy: TestSourceStudy,
  newData: Record<string, unknown>,
  expectedTitle: string,
  user = USER_CONTENT_ADMIN
): Promise<HCAAtlasTrackerDBSourceDataset> {
  const res = await doCreateTest(user, atlas, sourceStudy, newData);
  expect(res._getStatusCode()).toEqual(201);
  const newSourceDataset: HCAAtlasTrackerSourceDataset = res._getJSONData();
  const newSourceDatasetFromDb = await getSourceDataset(
    atlas.id,
    sourceStudy.id,
    newSourceDataset.id
  );
  expectDbSourceDatasetToMatch(
    newSourceDatasetFromDb,
    newSourceDataset,
    sourceStudy.id,
    expectedTitle
  );
  return newSourceDatasetFromDb;
}

async function doCreateTest(
  user: TestUser | undefined,
  atlas: Pick<TestAtlas, "id">,
  sourceStudy: TestSourceStudy,
  newData: Record<string, unknown>,
  hideConsoleError = false,
  method = METHOD.POST
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: newData,
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlas, sourceStudy),
  });
  await withConsoleErrorHiding(() => createHandler(req, res), hideConsoleError);
  return res;
}

function getQueryValues(
  atlas: Pick<TestAtlas, "id">,
  sourceStudy: TestSourceStudy
): Record<string, string> {
  return { atlasId: atlas.id, sourceStudyId: sourceStudy.id };
}

function expectDbSourceDatasetToMatch(
  dbSourceDataset: HCAAtlasTrackerDBSourceDatasetWithStudyProperties,
  apiSourceDataset: HCAAtlasTrackerSourceDataset,
  sourceStudyId: string,
  title: string
): void {
  expect(dbSourceDataset).toBeDefined();
  expect(dbSourceDataset.source_study_id).toEqual(sourceStudyId);
  expect(dbSourceDataset.sd_info.title).toEqual(title);
  expect(dbSourceDatasetToApiSourceDataset(dbSourceDataset)).toEqual(
    apiSourceDataset
  );
}
