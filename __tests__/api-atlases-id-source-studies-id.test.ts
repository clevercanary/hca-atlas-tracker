import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  DOI_STATUS,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerSourceStudy,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  SourceStudyEditData,
  UnpublishedSourceStudyEditData,
} from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import { startEntrySheetValidationsUpdate } from "../app/services/entry-sheets";
import { getSpreadsheetIdFromUrl } from "../app/utils/google-sheets";
import studyHandler from "../pages/api/atlases/[atlasId]/source-studies/[sourceStudyId]";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B,
  CELLXGENE_ID_NORMAL,
  DOI_DRAFT_OK,
  DOI_PREPRINT_NO_JOURNAL,
  DOI_WITH_NEW_SOURCE_DATASETS,
  ENTRY_SHEET_ID_DRAFT_OK_BAR,
  ENTRY_SHEET_ID_DRAFT_OK_FOO,
  PUBLICATION_PREPRINT_NO_JOURNAL,
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  SOURCE_DATASET_ATLAS_LINKED_B_FOO,
  SOURCE_DATASET_FOO,
  SOURCE_STUDY_DRAFT_NO_CROSSREF,
  SOURCE_STUDY_DRAFT_OK,
  SOURCE_STUDY_PUBLIC_NO_CROSSREF,
  SOURCE_STUDY_SHARED,
  SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE,
  SOURCE_STUDY_UNPUBLISHED_WITH_HCA,
  SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A,
  SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_B,
  SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO,
  STAKEHOLDER_ANALOGOUS_ROLES,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  expectApiSourceStudyToHaveMatchingDbValidations,
  getAllSourceDatasetsFromDatabase,
  getAtlasFromDatabase,
  getSourceDatasetFromDatabase,
  getSourceStudyEntrySheetValidationsFromDatabase,
  getSourceStudyFromDatabase,
  getSourceStudySourceDatasetsFromDatabase,
  getStudySourceDatasets,
  getValidationsByEntityId,
  resetDatabase,
} from "../testing/db-utils";
import {
  TestAtlas,
  TestSourceDataset,
  TestSourceStudy,
  TestUser,
} from "../testing/entities";
import {
  expectApiValidationsToMatchDb,
  expectSourceStudyToMatch,
  makeTestSourceStudyOverview,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");

jest.mock("next-auth");

const entrySheetsUpdateMock = startEntrySheetValidationsUpdate as jest.Mock;
let actualEntrySheetsModule: typeof import("../app/services/entry-sheets");

jest.mock("../app/services/entry-sheets", () => {
  const unchangedItems: Partial<typeof import("../app/services/entry-sheets")> =
    {
      deleteEntrySheetValidationsBySpreadsheet(...args) {
        return actualEntrySheetsModule.deleteEntrySheetValidationsBySpreadsheet(
          ...args
        );
      },
      deleteEntrySheetValidationsOfDeletedSourceStudy(...args) {
        return actualEntrySheetsModule.deleteEntrySheetValidationsOfDeletedSourceStudy(
          ...args
        );
      },
    };
  return {
    ...unchangedItems,
    startEntrySheetValidationsUpdate: jest.fn(() => Promise.resolve()),
  };
});

const TEST_ROUTE = "/api/atlases/[atlasId]/source-studies/[sourceStudyId]";

const SOURCE_STUDY_PUBLIC_NO_CROSSREF_EDIT: SourceStudyEditData = {
  capId: null,
  doi: DOI_PREPRINT_NO_JOURNAL,
  metadataSpreadsheets: [],
};

const SOURCE_STUDY_DRAFT_OK_EDIT: SourceStudyEditData = {
  capId: "https://celltype.info/project/223439",
  cellxgeneCollectionId: null,
  contactEmail: "bar@example.com",
  hcaProjectId: null,
  metadataSpreadsheets: [
    {
      url: `https://docs.google.com/spreadsheets/d/${ENTRY_SHEET_ID_DRAFT_OK_FOO}/edit`,
    },
    { url: "https://docs.google.com/spreadsheets/d/sheet-foo/edit" },
    { url: "https://docs.google.com/spreadsheets/d/sheet-bar/edit" },
  ],
  referenceAuthor: "Bar",
  title: "Baz",
};

const SOURCE_STUDY_DRAFT_OK_CAP_ID_EDIT: SourceStudyEditData = {
  capId: "https://celltype.info/project/627199",
  doi: DOI_DRAFT_OK,
  metadataSpreadsheets: [],
};

const SOURCE_STUDY_DRAFT_OK_METADATA_SPREADSHEET_EDIT: SourceStudyEditData = {
  capId: null,
  doi: DOI_DRAFT_OK,
  metadataSpreadsheets: [
    { url: "https://docs.google.com/spreadsheets/d/sheet-baz/edit" },
  ],
};

const SOURCE_STUDY_DRAFT_OK_NEW_SOURCE_DATASETS_EDIT: SourceStudyEditData = {
  capId: null,
  doi: DOI_WITH_NEW_SOURCE_DATASETS,
  metadataSpreadsheets: [],
};

const SOURCE_STUDY_UNPUBLISHED_WITH_HCA_EDIT: SourceStudyEditData = {
  capId: null,
  cellxgeneCollectionId: null,
  contactEmail: "barfoo@example.com",
  hcaProjectId: null,
  metadataSpreadsheets: [],
  referenceAuthor: "Barfoo",
  title: "Unpublished With HCA Edit",
};

const SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE_EDIT: SourceStudyEditData = {
  capId: null,
  cellxgeneCollectionId: null,
  contactEmail: null,
  hcaProjectId: null,
  metadataSpreadsheets: [],
  referenceAuthor: "Foo",
  title: "Unpublished With CELLxGENE",
};

beforeAll(async () => {
  actualEntrySheetsModule = jest.requireActual<
    typeof import("../app/services/entry-sheets")
  >("../app/services/entry-sheets");

  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe(`${TEST_ROUTE} (misc)`, () => {
  it("returns error 405 for POST request", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          undefined,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(405);
  });
});

describe(`${TEST_ROUTE} (GET)`, () => {
  it("returns error 401 when study is requested from public atlas by logged out user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          undefined,
          METHOD.GET,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when study is requested from public atlas by unregistered user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          USER_UNREGISTERED,
          METHOD.GET,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when study is requested from public atlas by disabled user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          USER_DISABLED_CONTENT_ADMIN
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 401 when study is GET requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_DRAFT_OK.id,
          undefined,
          METHOD.GET,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when study is GET requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_DRAFT_OK.id,
          USER_UNREGISTERED,
          METHOD.GET,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when study is GET requested from draft atlas by disabled user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_DRAFT_OK.id,
          USER_DISABLED_CONTENT_ADMIN
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 404 when study is GET requested by user with CONTENT_ADMIN role via atlas it doesn't exist on", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          USER_CONTENT_ADMIN,
          undefined,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns study, including validations, from public atlas when GET requested by logged in user with STAKEHOLDER role", async () => {
    const res = await doStudyRequest(
      ATLAS_PUBLIC.id,
      SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
      USER_STAKEHOLDER
    );
    expect(res._getStatusCode()).toEqual(200);
    const study = res._getJSONData() as HCAAtlasTrackerSourceStudy;
    expect(study.doi).toEqual(SOURCE_STUDY_PUBLIC_NO_CROSSREF.doi);
    await expectApiSourceStudyToHaveMatchingDbValidations(study);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns study",
      TEST_ROUTE,
      studyHandler,
      METHOD.GET,
      role,
      getQueryValues(ATLAS_DRAFT.id, SOURCE_STUDY_DRAFT_OK.id),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const study = res._getJSONData() as HCAAtlasTrackerSourceStudy;
        expect(study.doi).toEqual(SOURCE_STUDY_DRAFT_OK.doi);
      }
    );
  }

  it("returns study from draft atlas when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doStudyRequest(
      ATLAS_DRAFT.id,
      SOURCE_STUDY_DRAFT_OK.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const study = res._getJSONData() as HCAAtlasTrackerSourceStudy;
    expect(study.doi).toEqual(SOURCE_STUDY_DRAFT_OK.doi);
  });

  it("returns study with archived source dataset when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doStudyRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
      SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const study = res._getJSONData() as HCAAtlasTrackerSourceStudy;
    expect(study.sourceDatasetCount).toEqual(3);
  });
});

describe(`${TEST_ROUTE} (PUT)`, () => {
  it("returns error 401 when study is PUT requested from public atlas by logged out user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          undefined,
          METHOD.PUT,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF_EDIT,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("returns error 403 when study is PUT requested from public atlas by unregistered user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          USER_STAKEHOLDER,
          METHOD.PUT,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("returns error 403 when study is PUT requested from public atlas by disabled user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.PUT,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      studyHandler,
      METHOD.PUT,
      role,
      getQueryValues(ATLAS_PUBLIC.id, SOURCE_STUDY_PUBLIC_NO_CROSSREF.id),
      SOURCE_STUDY_PUBLIC_NO_CROSSREF_EDIT,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
      }
    );
  }

  it("returns error 403 when study is PUT requested from public atlas by logged in user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          USER_INTEGRATION_LEAD_DRAFT,
          METHOD.PUT,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("returns error 404 when study is PUT requested from atlas it doesn't exist on", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF_EDIT,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("returns error 400 for unpublished study PUT requested with contact email set to undefined", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_DRAFT_OK.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          {
            ...SOURCE_STUDY_DRAFT_OK_EDIT,
            contactEmail: undefined,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectStudyToBeUnchanged(SOURCE_STUDY_DRAFT_OK);
  });

  it("returns error 400 for unpublished study PUT requested with CELLxGENE ID set to undefined", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_DRAFT_OK.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          {
            ...SOURCE_STUDY_DRAFT_OK_EDIT,
            cellxgeneCollectionId: undefined,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectStudyToBeUnchanged(SOURCE_STUDY_DRAFT_OK);
  });

  it("returns error 400 for published study PUT requested with CELLxGENE ID specified", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          {
            ...SOURCE_STUDY_PUBLIC_NO_CROSSREF_EDIT,
            cellxgeneCollectionId: CELLXGENE_ID_NORMAL,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("returns error 400 when metadata spreadsheet URLs are non-unique", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_DRAFT_OK.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          {
            ...SOURCE_STUDY_DRAFT_OK_EDIT,
            metadataSpreadsheets: [
              {
                url:
                  SOURCE_STUDY_DRAFT_OK_EDIT.metadataSpreadsheets[0].url +
                  "?gid=0#gid=0",
              },
              ...SOURCE_STUDY_DRAFT_OK_EDIT.metadataSpreadsheets,
            ],
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectStudyToBeUnchanged(SOURCE_STUDY_DRAFT_OK);
  });

  it("returns error 400 when CAP ID is dataset URL rather than project URL", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_DRAFT_OK.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          {
            ...SOURCE_STUDY_DRAFT_OK_EDIT,
            capId: "https://celltype.info/project/223439/dataset/552505",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectStudyToBeUnchanged(SOURCE_STUDY_DRAFT_OK);
  });

  it("updates, revalidates, and returns study with published data, including validations, when PUT requested", async () => {
    const validationsBefore = await getValidationsByEntityId(
      SOURCE_STUDY_PUBLIC_NO_CROSSREF.id
    );
    expect(validationsBefore).not.toHaveLength(0);
    expect(validationsBefore[0].validation_info.doi).toEqual(
      SOURCE_STUDY_PUBLIC_NO_CROSSREF.doi
    );

    const res = await doStudyRequest(
      ATLAS_PUBLIC.id,
      SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      SOURCE_STUDY_PUBLIC_NO_CROSSREF_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedStudy = res._getJSONData() as HCAAtlasTrackerSourceStudy;
    const studyFromDb = await getSourceStudyFromDatabase(updatedStudy.id);
    expect(studyFromDb).toBeDefined();
    if (!studyFromDb) return;
    expect(studyFromDb.study_info.publication).toEqual(
      PUBLICATION_PREPRINT_NO_JOURNAL
    );
    expect(studyFromDb.study_info.hcaProjectId).toEqual(null);
    expect(studyFromDb.study_info.cellxgeneCollectionId).toEqual(null);
    expectSourceStudyToMatch(studyFromDb, updatedStudy);

    const validationsAfter = await getValidationsByEntityId(
      SOURCE_STUDY_PUBLIC_NO_CROSSREF.id
    );
    expect(validationsAfter).not.toHaveLength(0);
    expect(validationsAfter[0].validation_info.doi).toEqual(
      SOURCE_STUDY_PUBLIC_NO_CROSSREF_EDIT.doi
    );

    expectApiValidationsToMatchDb(updatedStudy.tasks, validationsAfter);

    expect(entrySheetsUpdateMock).toHaveBeenCalledTimes(0);

    await restoreDbStudy(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("updates and returns study with unpublished data when PUT requested", async () => {
    expect(entrySheetsUpdateMock).toHaveBeenCalledTimes(0);

    const validationEntrySheetIdsBefore = (
      await getSourceStudyEntrySheetValidationsFromDatabase(
        SOURCE_STUDY_DRAFT_OK.id
      )
    ).map((v) => v.entry_sheet_id);

    expect(validationEntrySheetIdsBefore).toContain(
      ENTRY_SHEET_ID_DRAFT_OK_FOO
    );
    expect(validationEntrySheetIdsBefore).toContain(
      ENTRY_SHEET_ID_DRAFT_OK_BAR
    );

    const res = await doStudyRequest(
      ATLAS_DRAFT.id,
      SOURCE_STUDY_DRAFT_OK.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      SOURCE_STUDY_DRAFT_OK_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedStudy = res._getJSONData();
    const studyFromDb = await getSourceStudyFromDatabase(updatedStudy.id);
    expect(studyFromDb).toBeDefined();
    if (!studyFromDb) return;

    expectDbSourceStudyToMatchUnpublishedEdit(
      studyFromDb,
      SOURCE_STUDY_DRAFT_OK_EDIT
    );

    const validationEntrySheetIdsAfter = (
      await getSourceStudyEntrySheetValidationsFromDatabase(
        SOURCE_STUDY_DRAFT_OK.id
      )
    ).map((v) => v.entry_sheet_id);

    expect(validationEntrySheetIdsAfter).toContain(ENTRY_SHEET_ID_DRAFT_OK_FOO);
    expect(validationEntrySheetIdsAfter).not.toContain(
      ENTRY_SHEET_ID_DRAFT_OK_BAR
    );

    expect(entrySheetsUpdateMock).toHaveBeenCalledTimes(1);
    expect(entrySheetsUpdateMock).toHaveBeenLastCalledWith<
      Parameters<typeof startEntrySheetValidationsUpdate>
    >([
      {
        bioNetwork: ATLAS_DRAFT.network,
        sourceStudyId: SOURCE_STUDY_DRAFT_OK.id,
        spreadsheetId: "sheet-foo",
      },
      {
        bioNetwork: ATLAS_DRAFT.network,
        sourceStudyId: SOURCE_STUDY_DRAFT_OK.id,
        spreadsheetId: "sheet-bar",
      },
    ]);

    await restoreDbStudy(SOURCE_STUDY_DRAFT_OK);

    entrySheetsUpdateMock.mockClear();
  });

  it("updates and returns study with CAP ID when PUT requested", async () => {
    const res = await doStudyRequest(
      ATLAS_DRAFT.id,
      SOURCE_STUDY_DRAFT_OK.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      SOURCE_STUDY_DRAFT_OK_CAP_ID_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedStudy = res._getJSONData() as HCAAtlasTrackerSourceStudy;
    expect(updatedStudy.capId).toEqual(SOURCE_STUDY_DRAFT_OK_CAP_ID_EDIT.capId);
    const studyFromDb = await getSourceStudyFromDatabase(updatedStudy.id);
    expect(studyFromDb).toBeDefined();
    if (!studyFromDb) return;
    expect(studyFromDb.study_info.capId).toEqual(
      SOURCE_STUDY_DRAFT_OK_CAP_ID_EDIT.capId
    );

    expect(entrySheetsUpdateMock).toHaveBeenCalledTimes(0);

    await restoreDbStudy(SOURCE_STUDY_DRAFT_OK);
  });

  it("updates and returns published study with metadata spreadsheet when PUT requested", async () => {
    expect(entrySheetsUpdateMock).toHaveBeenCalledTimes(0);

    const res = await doStudyRequest(
      ATLAS_DRAFT.id,
      SOURCE_STUDY_DRAFT_OK.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      SOURCE_STUDY_DRAFT_OK_METADATA_SPREADSHEET_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const editIds =
      SOURCE_STUDY_DRAFT_OK_METADATA_SPREADSHEET_EDIT.metadataSpreadsheets.map(
        ({ url }) => getSpreadsheetIdFromUrl(url)
      );
    const updatedStudy = res._getJSONData() as HCAAtlasTrackerSourceStudy;
    expect(updatedStudy.metadataSpreadsheets.map(({ id }) => id)).toEqual(
      editIds
    );
    const studyFromDb = await getSourceStudyFromDatabase(updatedStudy.id);
    expect(studyFromDb).toBeDefined();
    if (!studyFromDb) return;
    expect(
      studyFromDb.study_info.metadataSpreadsheets.map(({ id }) => id)
    ).toEqual(editIds);

    expect(entrySheetsUpdateMock).toHaveBeenCalledTimes(1);
    expect(entrySheetsUpdateMock).toHaveBeenLastCalledWith<
      Parameters<typeof startEntrySheetValidationsUpdate>
    >([
      {
        bioNetwork: ATLAS_DRAFT.network,
        sourceStudyId: SOURCE_STUDY_DRAFT_OK.id,
        spreadsheetId: "sheet-baz",
      },
    ]);

    await restoreDbStudy(SOURCE_STUDY_DRAFT_OK);

    entrySheetsUpdateMock.mockClear();
  });

  it("updates and returns study with unpublished data when PUT requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    const res = await doStudyRequest(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
      SOURCE_STUDY_UNPUBLISHED_WITH_HCA.id,
      USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
      METHOD.PUT,
      SOURCE_STUDY_UNPUBLISHED_WITH_HCA_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedStudy = res._getJSONData();
    const studyFromDb = await getSourceStudyFromDatabase(updatedStudy.id);
    expect(studyFromDb).toBeDefined();
    if (!studyFromDb) return;

    expectDbSourceStudyToMatchUnpublishedEdit(
      studyFromDb,
      SOURCE_STUDY_UNPUBLISHED_WITH_HCA_EDIT
    );

    expect(entrySheetsUpdateMock).toHaveBeenCalledTimes(0);

    await restoreDbStudy(SOURCE_STUDY_UNPUBLISHED_WITH_HCA);
  });

  it("does not update CELLxGENE datasets when source study is PUT requested", async () => {
    const studyDatasetsBefore = await getStudySourceDatasets(
      SOURCE_STUDY_DRAFT_OK.id
    );

    expect(studyDatasetsBefore).toHaveLength(2);

    const datasetsBefore = await getAllSourceDatasetsFromDatabase();

    const res = await doStudyRequest(
      ATLAS_DRAFT.id,
      SOURCE_STUDY_DRAFT_OK.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      SOURCE_STUDY_DRAFT_OK_NEW_SOURCE_DATASETS_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);

    const updatedStudy = res._getJSONData() as HCAAtlasTrackerSourceStudy;

    expect(updatedStudy.sourceDatasetCount).toEqual(2);

    const studyDatasetsAfter = await getStudySourceDatasets(
      SOURCE_STUDY_DRAFT_OK.id
    );

    expect(studyDatasetsAfter).toHaveLength(2);

    const datasetsAfter = await getAllSourceDatasetsFromDatabase();

    expect(datasetsAfter).toEqual(datasetsBefore);

    expect(entrySheetsUpdateMock).toHaveBeenCalledTimes(0);

    await restoreDbStudy(SOURCE_STUDY_DRAFT_OK);
  });

  it("does not delete CELLxGENE datasets when source study is PUT requested with CELLxGENE ID removed", async () => {
    const studyDatasetsBefore = await getStudySourceDatasets(
      SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id
    );

    expect(studyDatasetsBefore).toHaveLength(3);

    const datasetsBefore = await getAllSourceDatasetsFromDatabase(true);

    const res = await doStudyRequest(
      ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B.id,
      SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);

    const updatedStudy = res._getJSONData() as HCAAtlasTrackerSourceStudy;

    expect(updatedStudy.sourceDatasetCount).toEqual(3);

    const studyDatasetsAfter = await getStudySourceDatasets(
      SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id
    );

    expect(studyDatasetsAfter).toHaveLength(3);

    const datasetsAfter = await getAllSourceDatasetsFromDatabase(true);

    expect(datasetsAfter).toEqual(datasetsBefore);

    expect(entrySheetsUpdateMock).toHaveBeenCalledTimes(0);

    await restoreDbStudy(SOURCE_STUDY_DRAFT_OK);
  });
});

describe(`${TEST_ROUTE} (DELETE)`, () => {
  it("returns error 401 when study is DELETE requested from public atlas by logged out user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          undefined,
          METHOD.DELETE,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(401);
    await expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("returns error 403 when study is DELETE requested from public atlas by unregistered user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          USER_STAKEHOLDER,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("returns error 403 when study is DELETE requested from public atlas by disabled user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD) {
    testApiRole(
      "returns error 403",
      TEST_ROUTE,
      studyHandler,
      METHOD.DELETE,
      role,
      getQueryValues(ATLAS_PUBLIC.id, SOURCE_STUDY_PUBLIC_NO_CROSSREF.id),
      undefined,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(403);
        await expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
      }
    );
  }

  it("returns error 403 when study is DELETE requested from public atlas by logged in user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          USER_INTEGRATION_LEAD_DRAFT,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("returns error 404 when study is DELETE requested from atlas it doesn't exist on", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("returns error 400 when study of a single atlas is DELETE requested", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_B.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectStudyToBeUnchanged(SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_B);
    await expectAtlasSourceDatasetListToBeUnchanged(
      ATLAS_WITH_MISC_SOURCE_STUDIES
    );
    await expectSourceDatasetToExist(SOURCE_DATASET_ATLAS_LINKED_B_FOO);
  });

  it("returns error 400 when study of multiple atlases is DELETE requested from atlas it has datasets on", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectStudyToBeUnchanged(SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A);
    await expectAtlasSourceDatasetListToBeUnchanged(
      ATLAS_WITH_MISC_SOURCE_STUDIES
    );
    await expectSourceDatasetToExist(SOURCE_DATASET_ATLAS_LINKED_A_FOO);
  });

  it("deletes source study only from specified atlas and revalidates when shared by multiple atlases", async () => {
    const validationsBefore = await getValidationsByEntityId(
      SOURCE_STUDY_SHARED.id
    );
    expect(validationsBefore).not.toHaveLength(0);
    expect(validationsBefore[0].atlas_ids).toHaveLength(2);

    const datasetsBefore = await getSourceStudySourceDatasetsFromDatabase(
      SOURCE_STUDY_DRAFT_OK.id
    );
    expect(datasetsBefore).toHaveLength(2);
    expect(datasetsBefore[0].source_study_id).toEqual(SOURCE_STUDY_DRAFT_OK.id);

    expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_SHARED.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);
    const draftStudys = (await getAtlasFromDatabase(ATLAS_DRAFT.id))
      ?.source_studies;
    expect(draftStudys).not.toContain(SOURCE_STUDY_SHARED.id);
    const publicStudys = (await getAtlasFromDatabase(ATLAS_PUBLIC.id))
      ?.source_studies;
    expect(publicStudys).toContain(SOURCE_STUDY_SHARED.id);
    await expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);

    const validationsAfter = await getValidationsByEntityId(
      SOURCE_STUDY_SHARED.id
    );
    expect(validationsAfter).not.toHaveLength(0);
    expect(validationsAfter[0].atlas_ids).toHaveLength(1);

    const datasetsAfter = await getSourceStudySourceDatasetsFromDatabase(
      SOURCE_STUDY_DRAFT_OK.id
    );
    expect(datasetsAfter).toHaveLength(2);
    expect(datasetsAfter[0].source_study_id).toEqual(SOURCE_STUDY_DRAFT_OK.id);

    expect(
      await getSourceDatasetFromDatabase(SOURCE_DATASET_FOO.id)
    ).toBeDefined();

    await query("UPDATE hat.atlases SET source_studies=$1 WHERE id=$2", [
      JSON.stringify(ATLAS_DRAFT.sourceStudies),
      ATLAS_DRAFT.id,
    ]);
  });

  it("fails to delete source study containing source datasets due to linked entity constraint on files", async () => {
    const res = await doStudyRequest(
      ATLAS_DRAFT.id,
      SOURCE_STUDY_DRAFT_OK.id,
      USER_CONTENT_ADMIN,
      METHOD.DELETE,
      undefined,
      true
    );
    expect(res._getStatusCode()).toEqual(500);
    expect(res._getJSONData().message).toEqual(
      expect.stringContaining("ck_files_exclusive_parent_relationship")
    );
    expect(
      await getSourceStudyFromDatabase(SOURCE_STUDY_DRAFT_OK.id)
    ).toBeDefined();
  });

  it("deletes source study entirely, including validations, when only in one atlas", async () => {
    const validationsBefore = await getValidationsByEntityId(
      SOURCE_STUDY_PUBLIC_NO_CROSSREF.id
    );
    expect(validationsBefore).not.toHaveLength(0);

    await expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);
    const publicStudies = (await getAtlasFromDatabase(ATLAS_PUBLIC.id))
      ?.source_studies;
    expect(publicStudies).not.toContain(SOURCE_STUDY_PUBLIC_NO_CROSSREF.id);
    const studyFromDb = await getSourceStudyFromDatabase(
      SOURCE_STUDY_PUBLIC_NO_CROSSREF.id
    );
    expect(studyFromDb).toBeUndefined();

    const validationsAfter = await getValidationsByEntityId(
      SOURCE_STUDY_PUBLIC_NO_CROSSREF.id
    );
    expect(validationsAfter).toHaveLength(0);
  });

  it("deletes entry sheet validations when source study is fully deleted", async () => {
    const entrySheetValidationsBefore =
      await getSourceStudyEntrySheetValidationsFromDatabase(
        SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO.id
      );
    expect(entrySheetValidationsBefore).toHaveLength(1);

    await expect(
      (
        await doStudyRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);
    const atlasStudies = (
      await getAtlasFromDatabase(ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id)
    )?.source_studies;
    expect(atlasStudies).not.toContain(
      SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO.id
    );
    const studyFromDb = await getSourceStudyFromDatabase(
      SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO.id
    );
    expect(studyFromDb).toBeUndefined();

    const entrySheetValidationsAfter =
      await getSourceStudyEntrySheetValidationsFromDatabase(
        SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO.id
      );
    expect(entrySheetValidationsAfter).toHaveLength(0);
  });

  it("deletes source study when requested by user with INTEGRATION_LEAD role for the atlas", async () => {
    await expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_DRAFT_NO_CROSSREF.id,
          USER_INTEGRATION_LEAD_DRAFT,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);
    const draftStudies = (await getAtlasFromDatabase(ATLAS_DRAFT.id))
      ?.source_studies;
    expect(draftStudies).not.toContain(SOURCE_STUDY_DRAFT_NO_CROSSREF.id);
    const studyFromDb = await getSourceStudyFromDatabase(
      SOURCE_STUDY_DRAFT_NO_CROSSREF.id
    );
    expect(studyFromDb).toBeUndefined();
  });
});

async function doStudyRequest(
  atlasId: string,
  sourceStudyId: string,
  user?: TestUser,
  method = METHOD.GET,
  updatedData?: Record<string, unknown>,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: updatedData,
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId, sourceStudyId),
  });
  await withConsoleErrorHiding(() => studyHandler(req, res), hideConsoleError);
  return res;
}

function getQueryValues(
  atlasId: string,
  sourceStudyId: string
): Record<string, string> {
  return { atlasId, sourceStudyId };
}

async function restoreDbStudy(study: TestSourceStudy): Promise<void> {
  await query(
    "UPDATE hat.source_studies SET doi=$1, study_info=$2 WHERE id=$3",
    [
      "doi" in study ? study.doi : null,
      JSON.stringify(makeTestSourceStudyOverview(study)),
      study.id,
    ]
  );
}

function expectDbSourceStudyToMatchUnpublishedEdit(
  studyFromDb: HCAAtlasTrackerDBSourceStudy,
  editData: UnpublishedSourceStudyEditData
): void {
  expect(studyFromDb.doi).toEqual(null);
  expect(studyFromDb.study_info.publication).toEqual(null);
  expect(studyFromDb.study_info.doiStatus).toEqual(DOI_STATUS.NA);

  const { unpublishedInfo } = studyFromDb.study_info;
  expect(unpublishedInfo?.contactEmail).toEqual(editData.contactEmail);
  expect(unpublishedInfo?.referenceAuthor).toEqual(editData.referenceAuthor);
  expect(unpublishedInfo?.title).toEqual(editData.title);
  expect(studyFromDb.study_info.capId).toEqual(editData.capId);
  expect(studyFromDb.study_info.cellxgeneCollectionId).toEqual(
    editData.cellxgeneCollectionId
  );
  expect(studyFromDb.study_info.hcaProjectId).toEqual(editData.hcaProjectId);
  expect(
    studyFromDb.study_info.metadataSpreadsheets.map((sheet) => sheet.id)
  ).toEqual(
    editData.metadataSpreadsheets.map((sheet) =>
      getSpreadsheetIdFromUrl(sheet.url)
    )
  );
}

async function expectStudyToBeUnchanged(study: TestSourceStudy): Promise<void> {
  const studyFromDb = await getSourceStudyFromDatabase(study.id);
  expect(studyFromDb).toBeDefined();
  if (!studyFromDb) return;
  if ("unpublishedInfo" in study) {
    expect(studyFromDb.study_info.unpublishedInfo).toEqual(
      study.unpublishedInfo
    );
  } else {
    expect(studyFromDb.doi).toEqual(study.doi);
    expect(studyFromDb.study_info.doiStatus).toEqual(study.doiStatus);
    expect(studyFromDb.study_info.publication).toEqual(study.publication);
  }
}

async function expectAtlasSourceDatasetListToBeUnchanged(
  atlas: TestAtlas
): Promise<void> {
  const atlasFromDb = await getAtlasFromDatabase(atlas.id);
  expect(atlasFromDb).toBeDefined();
  expect(atlasFromDb?.source_datasets).toEqual(atlas.sourceDatasets);
}

async function expectSourceDatasetToExist(
  sourceDataset: TestSourceDataset
): Promise<void> {
  expect(await getSourceDatasetFromDatabase(sourceDataset.id)).toBeDefined();
}
