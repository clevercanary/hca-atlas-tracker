import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDetailSourceDataset,
  HCAAtlasTrackerSourceDataset,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasSourceDatasetEditData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import { getSheetTitleForApi } from "../app/utils/google-sheets-api";
import sourceDatasetHandler from "../pages/api/atlases/[atlasId]/source-datasets/[sourceDatasetId]";
import {
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  ATLAS_WITH_MISC_SOURCE_STUDIES_C,
  ATLAS_WITH_NON_LATEST_METADATA_ENTITIES,
  FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES,
  SOURCE_DATASET_ATLAS_LINKED_A_BAR,
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  SOURCE_DATASET_ATLAS_LINKED_B_BAR,
  SOURCE_DATASET_ATLAS_LINKED_B_BAZ,
  SOURCE_DATASET_ATLAS_LINKED_B_FOO,
  SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_BAR,
  SOURCE_DATASET_ID_WITH_ARCHIVED_LATEST,
  SOURCE_DATASET_ID_WITH_MULTIPLE_FILES,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W3,
  SOURCE_DATASET_WITH_ARCHIVED_LATEST_W2,
  SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
  SOURCE_DATASET_WITH_SOURCE_STUDY_FOO,
  STAKEHOLDER_ANALOGOUS_ROLES,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  expectSourceDatasetToBeUnchanged,
  resetDatabase,
} from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import {
  expectDetailApiSourceDatasetToMatchTest,
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

const getSheetTitleMock = getSheetTitleForApi as jest.Mock;

jest.mock("../app/utils/google-sheets-api", () => {
  const googleSheetsApi: typeof import("../app/utils/google-sheets-api") =
    jest.requireActual("../app/utils/google-sheets-api");

  return {
    getSheetTitleForApi: jest.fn(googleSheetsApi.getSheetTitleForApi),
  };
});

const RETURNS_ERROR_403 = "returns error 403";

const TEST_ROUTE = "/api/atlases/[atlasId]/source-datasets/[sourceDatasetId]";

const SOURCE_DATASET_ID_NONEXISTENT = "52281fde-232c-4481-8b45-cc986570e7b9";

const A_FOO_EDIT_DATA: AtlasSourceDatasetEditData = {
  capUrl: null,
  metadataSpreadsheetUrl: "https://docs.google.com/spreadsheets/d/sheet-bar",
};

const B_BAR_EDIT_DATA: AtlasSourceDatasetEditData = {
  capUrl: null,
  metadataSpreadsheetUrl: "",
};

const A_BAR_EDIT_DATA: AtlasSourceDatasetEditData = {
  capUrl: "https://celltype.info/project/534534/dataset/234727",
};

const WSS_FOO_EDIT_DATA: AtlasSourceDatasetEditData = {
  capUrl: "",
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
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_B_BAZ.id,
          undefined,
          METHOD.PUT,
        )
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 405 for POST request", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_B_BAZ.id,
          undefined,
          METHOD.POST,
        )
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 405 for DELETE request", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_B_BAZ.id,
          undefined,
          METHOD.DELETE,
        )
      )._getStatusCode(),
    ).toEqual(405);
  });
});

describe(`${TEST_ROUTE} (GET)`, () => {
  it("returns error 401 when source dataset is GET requested by logged out user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          undefined,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 when source dataset is GET requested by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          USER_UNREGISTERED,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 when source dataset is GET requested by disabled user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.GET,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns source dataset",
      TEST_ROUTE,
      sourceDatasetHandler,
      METHOD.GET,
      role,
      getQueryValues(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
        SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
      ),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const sourceDataset =
          res._getJSONData() as HCAAtlasTrackerDetailSourceDataset;
        expectDetailApiSourceDatasetToMatchTest(
          sourceDataset,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO,
        );
      },
    );
  }

  it("returns source dataset with metadata when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset =
      res._getJSONData() as HCAAtlasTrackerDetailSourceDataset;
    expectDetailApiSourceDatasetToMatchTest(
      sourceDataset,
      SOURCE_DATASET_ATLAS_LINKED_A_FOO,
    );
    expect(sourceDataset.title).not.toEqual("");
    expect(sourceDataset.cellCount).not.toEqual(0);
    expect(sourceDataset.assay).not.toEqual([]);
    expect(sourceDataset.disease).not.toEqual([]);
    expect(sourceDataset.suspensionType).not.toEqual([]);
    expect(sourceDataset.tissue).not.toEqual([]);
  });

  it("returns source dataset without metadata when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_DATASET_ATLAS_LINKED_A_BAR.id,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset =
      res._getJSONData() as HCAAtlasTrackerDetailSourceDataset;
    expectDetailApiSourceDatasetToMatchTest(
      sourceDataset,
      SOURCE_DATASET_ATLAS_LINKED_A_BAR,
    );
    expect(sourceDataset.title).toEqual("");
    expect(sourceDataset.cellCount).toEqual(0);
    expect(sourceDataset.assay).toEqual([]);
    expect(sourceDataset.disease).toEqual([]);
    expect(sourceDataset.suspensionType).toEqual([]);
    expect(sourceDataset.tissue).toEqual([]);
  });

  it("returns data from latest of multiple file versions", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      SOURCE_DATASET_ID_WITH_MULTIPLE_FILES,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset =
      res._getJSONData() as HCAAtlasTrackerDetailSourceDataset;
    expectDetailApiSourceDatasetToMatchTest(
      sourceDataset,
      SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
    );
    expect(sourceDataset.sizeBytes).toEqual(
      Number(FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES.sizeBytes),
    );
  });

  it("returns archived source dataset", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      SOURCE_DATASET_ID_WITH_ARCHIVED_LATEST,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset =
      res._getJSONData() as HCAAtlasTrackerDetailSourceDataset;
    expectDetailApiSourceDatasetToMatchTest(
      sourceDataset,
      SOURCE_DATASET_WITH_ARCHIVED_LATEST_W2,
    );
  });

  it("returns non-latest source dataset linked to atlas", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
      SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_BAR,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset =
      res._getJSONData() as HCAAtlasTrackerDetailSourceDataset;
    expectDetailApiSourceDatasetToMatchTest(
      sourceDataset,
      SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2,
    );
  });
});

describe(`${TEST_ROUTE} (PATCH)`, () => {
  it("returns error 401 when PATCH requested by logged out user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          undefined,
          METHOD.PATCH,
          true,
          A_FOO_EDIT_DATA,
        )
      )._getStatusCode(),
    ).toEqual(401);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it("returns error 403 when PATCH requested by unregistered user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          USER_UNREGISTERED,
          METHOD.PATCH,
          true,
          A_FOO_EDIT_DATA,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it("returns error 403 when PATCH requested by disabled user", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.PATCH,
          false,
          A_FOO_EDIT_DATA,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      RETURNS_ERROR_403,
      TEST_ROUTE,
      sourceDatasetHandler,
      METHOD.PATCH,
      role,
      getQueryValues(
        ATLAS_WITH_MISC_SOURCE_STUDIES.id,
        SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
      ),
      A_FOO_EDIT_DATA,
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
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          USER_INTEGRATION_LEAD_PUBLIC,
          METHOD.PATCH,
          false,
          A_FOO_EDIT_DATA,
        )
      )._getStatusCode(),
    ).toEqual(403);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it("returns error 404 when PATCH requested with nonexistent source dataset", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ID_NONEXISTENT,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
          A_FOO_EDIT_DATA,
        )
      )._getStatusCode(),
    ).toEqual(404);
  });

  it("returns error 404 when PATCH requested with source dataset the atlas doesn't have", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_B_BAZ.id,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
          A_FOO_EDIT_DATA,
        )
      )._getStatusCode(),
    ).toEqual(404);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_B_BAZ);
  });

  it("returns error 400 when PATCH requested with source dataset with archived file", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
          SOURCE_DATASET_ID_WITH_ARCHIVED_LATEST,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
          A_FOO_EDIT_DATA,
        )
      )._getStatusCode(),
    ).toEqual(400);
    await expectSourceDatasetToBeUnchanged(
      SOURCE_DATASET_WITH_ARCHIVED_LATEST_W2,
    );
  });

  it("returns error 400 when PATCH requested with source dataset with non-latest version linked to the atlas", async () => {
    const editData = {
      capUrl: "https://celltype.info/project/376345/dataset/745632",
    } satisfies AtlasSourceDatasetEditData;
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_NON_LATEST_METADATA_ENTITIES.id,
          SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_BAR,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
          editData,
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

  it("returns error 400 when PATCH requested with non-google-sheets metadata url", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
          {
            ...A_FOO_EDIT_DATA,
            metadataSpreadsheetUrl: "https://example.com",
          },
        )
      )._getStatusCode(),
    ).toEqual(400);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it("returns error 400 when PATCH requested with unshared matadata sheet URL", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
          {
            ...A_FOO_EDIT_DATA,
            metadataSpreadsheetUrl:
              "https://docs.google.com/spreadsheets/d/nonexistent/edit",
          },
        )
      )._getStatusCode(),
    ).toEqual(400);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it("returns error 400 when PATCH requested with a non-CAP URL in CAP URL field", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_BAR.id,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
          {
            ...A_BAR_EDIT_DATA,
            capUrl: "https://example.com/not-a-cap-url",
          },
        )
      )._getStatusCode(),
    ).toEqual(400);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it("returns error 400 when PATCH requested with a non-dataset CAP URL", async () => {
    expect(
      (
        await doSourceDatasetRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_DATASET_ATLAS_LINKED_A_BAR.id,
          USER_CONTENT_ADMIN,
          METHOD.PATCH,
          true,
          {
            ...A_BAR_EDIT_DATA,
            capUrl: "https://celltype.info/project/534534",
          },
        )
      )._getStatusCode(),
    ).toEqual(400);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it("updates and returns source dataset when PATCH requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_DATASET_ATLAS_LINKED_B_BAR.id,
      USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
      METHOD.PATCH,
      true,
      B_BAR_EDIT_DATA,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset = res._getJSONData() as HCAAtlasTrackerSourceDataset;
    expect(sourceDataset.capUrl).toBeNull();
    expect(sourceDataset.metadataSpreadsheetUrl).toEqual(null);
    expect(sourceDataset.title).toEqual(
      SOURCE_DATASET_ATLAS_LINKED_B_BAR.file.datasetInfo.title,
    );
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_B_FOO);
  });

  it("updates and returns source dataset when PATCH requested by user with CONTENT_ADMIN role", async () => {
    const callCountBefore = getSheetTitleMock.mock.calls.length;
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_DATASET_ATLAS_LINKED_A_FOO.id,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      true,
      A_FOO_EDIT_DATA,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset = res._getJSONData() as HCAAtlasTrackerSourceDataset;
    expect(sourceDataset.capUrl).toBeNull();
    expect(sourceDataset.metadataSpreadsheetTitle).toEqual("Sheet Bar");
    expect(sourceDataset.metadataSpreadsheetUrl).toEqual(
      A_FOO_EDIT_DATA.metadataSpreadsheetUrl,
    );
    expect(sourceDataset.title).toEqual(
      SOURCE_DATASET_ATLAS_LINKED_A_FOO.file.datasetInfo.title,
    );
    expect(getSheetTitleMock).toHaveBeenCalledTimes(callCountBefore + 1);
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_B_FOO);
  });

  it("sets CAP URL and clears metadata spreadsheet fields when PATCH requested with only CAP URL specified", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_DATASET_ATLAS_LINKED_A_BAR.id,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      true,
      A_BAR_EDIT_DATA,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset = res._getJSONData() as HCAAtlasTrackerSourceDataset;
    expect(sourceDataset.capUrl).toEqual(A_BAR_EDIT_DATA.capUrl);
    expect(sourceDataset.metadataSpreadsheetTitle).toBeNull();
    expect(sourceDataset.metadataSpreadsheetUrl).toBeNull();
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_B_FOO);
  });

  it("sets CAP URL to null and clears metadata spreadsheet fields when PATCH requested with only empty string CAP URL", async () => {
    const res = await doSourceDatasetRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_C.id,
      SOURCE_DATASET_WITH_SOURCE_STUDY_FOO.id,
      USER_CONTENT_ADMIN,
      METHOD.PATCH,
      true,
      WSS_FOO_EDIT_DATA,
    );
    expect(res._getStatusCode()).toEqual(200);
    const sourceDataset = res._getJSONData() as HCAAtlasTrackerSourceDataset;
    expect(sourceDataset.capUrl).toBeNull();
    expect(sourceDataset.metadataSpreadsheetTitle).toBeNull();
    expect(sourceDataset.metadataSpreadsheetUrl).toBeNull();
    await expectSourceDatasetToBeUnchanged(SOURCE_DATASET_ATLAS_LINKED_B_FOO);
  });
});

async function doSourceDatasetRequest(
  atlasId: string,
  sourceDatasetId: string,
  user?: TestUser,
  method = METHOD.POST,
  hideConsoleError = false,
  body?: Record<string, unknown>,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body,
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId, sourceDatasetId),
  });
  await withConsoleErrorHiding(
    () => sourceDatasetHandler(req, res),
    hideConsoleError,
  );
  return res;
}

function getQueryValues(
  atlasId: string,
  sourceDatasetId: string,
): Record<string, string> {
  return { atlasId, sourceDatasetId };
}
