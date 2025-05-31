import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  DOI_STATUS,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerSourceStudy,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  SourceStudyEditData,
  UnpublishedSourceStudyEditData,
} from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import studyHandler from "../pages/api/atlases/[atlasId]/source-studies/[sourceStudyId]";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B,
  CELLXGENE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR,
  CELLXGENE_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO,
  CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_BAR,
  CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_FOO,
  CELLXGENE_ID_NORMAL,
  COMPONENT_ATLAS_DRAFT_FOO,
  COMPONENT_ATLAS_MISC_FOO,
  COMPONENT_ATLAS_WITH_CELLXGENE_DATASETS,
  DOI_DRAFT_OK,
  DOI_PREPRINT_NO_JOURNAL,
  DOI_WITH_NEW_SOURCE_DATASETS,
  PUBLICATION_PREPRINT_NO_JOURNAL,
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  SOURCE_DATASET_ATLAS_LINKED_B_FOO,
  SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_OTHER_BAR,
  SOURCE_DATASET_OTHER_FOO,
  SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR,
  SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAZ,
  SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO,
  SOURCE_STUDY_DRAFT_NO_CROSSREF,
  SOURCE_STUDY_DRAFT_OK,
  SOURCE_STUDY_PUBLIC_NO_CROSSREF,
  SOURCE_STUDY_SHARED,
  SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE,
  SOURCE_STUDY_UNPUBLISHED_WITH_HCA,
  SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A,
  SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_B,
  SOURCE_STUDY_WITH_OTHER_SOURCE_DATASETS,
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
  getAtlasFromDatabase,
  getCellxGeneSourceDatasetFromDatabase,
  getComponentAtlasFromDatabase,
  getExistingComponentAtlasFromDatabase,
  getSourceStudyFromDatabase,
  getStudySourceDatasets,
  getValidationsByEntityId,
  initSourceDatasets,
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
  expectAtlasDatasetsToHaveDifference,
  expectComponentAtlasDatasetsToHaveDifference,
  expectIsDefined,
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
    const studyFromDb = await getStudyFromDatabase(updatedStudy.id);
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

    await restoreDbStudy(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("updates and returns study with unpublished data when PUT requested", async () => {
    const res = await doStudyRequest(
      ATLAS_DRAFT.id,
      SOURCE_STUDY_DRAFT_OK.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      SOURCE_STUDY_DRAFT_OK_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedStudy = res._getJSONData();
    const studyFromDb = await getStudyFromDatabase(updatedStudy.id);
    expect(studyFromDb).toBeDefined();
    if (!studyFromDb) return;

    expectDbSourceStudyToMatchUnpublishedEdit(
      studyFromDb,
      SOURCE_STUDY_DRAFT_OK_EDIT
    );

    await restoreDbStudy(SOURCE_STUDY_DRAFT_OK);
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
    const studyFromDb = await getStudyFromDatabase(updatedStudy.id);
    expect(studyFromDb).toBeDefined();
    if (!studyFromDb) return;
    expect(studyFromDb.study_info.capId).toEqual(
      SOURCE_STUDY_DRAFT_OK_CAP_ID_EDIT.capId
    );

    await restoreDbStudy(SOURCE_STUDY_DRAFT_OK);
  });

  it("updates and returns published study with metadata spreadsheet when PUT requested", async () => {
    const res = await doStudyRequest(
      ATLAS_DRAFT.id,
      SOURCE_STUDY_DRAFT_OK.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      SOURCE_STUDY_DRAFT_OK_METADATA_SPREADSHEET_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const editUrls =
      SOURCE_STUDY_DRAFT_OK_METADATA_SPREADSHEET_EDIT.metadataSpreadsheets.map(
        ({ url }) => url
      );
    const updatedStudy = res._getJSONData() as HCAAtlasTrackerSourceStudy;
    expect(updatedStudy.metadataSpreadsheets.map(({ url }) => url)).toEqual(
      editUrls
    );
    const studyFromDb = await getStudyFromDatabase(updatedStudy.id);
    expect(studyFromDb).toBeDefined();
    if (!studyFromDb) return;
    expect(
      studyFromDb.study_info.metadataSpreadsheets.map(({ url }) => url)
    ).toEqual(editUrls);

    await restoreDbStudy(SOURCE_STUDY_DRAFT_OK);
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
    const studyFromDb = await getStudyFromDatabase(updatedStudy.id);
    expect(studyFromDb).toBeDefined();
    if (!studyFromDb) return;

    expectDbSourceStudyToMatchUnpublishedEdit(
      studyFromDb,
      SOURCE_STUDY_UNPUBLISHED_WITH_HCA_EDIT
    );

    await restoreDbStudy(SOURCE_STUDY_UNPUBLISHED_WITH_HCA);
  });

  it("updates CELLxGENE datasets when source study is PUT requested", async () => {
    const studyDatasetsBefore = await getStudySourceDatasets(
      SOURCE_STUDY_DRAFT_OK.id
    );

    expect(studyDatasetsBefore).toHaveLength(2);

    const fooBefore = await getCellxGeneSourceDatasetFromDatabase(
      CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_FOO.dataset_id
    );
    const barBefore = await getCellxGeneSourceDatasetFromDatabase(
      CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_BAR.dataset_id
    );

    expect(fooBefore).toBeNull();
    expect(barBefore).toBeNull();

    const res = await doStudyRequest(
      ATLAS_DRAFT.id,
      SOURCE_STUDY_DRAFT_OK.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      SOURCE_STUDY_DRAFT_OK_NEW_SOURCE_DATASETS_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);

    const updatedStudy = res._getJSONData() as HCAAtlasTrackerSourceStudy;

    expect(updatedStudy.sourceDatasetCount).toEqual(4);

    const studyDatasetsAfter = await getStudySourceDatasets(
      SOURCE_STUDY_DRAFT_OK.id
    );

    expect(studyDatasetsAfter).toHaveLength(4);

    const fooAfter = await getCellxGeneSourceDatasetFromDatabase(
      CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_FOO.dataset_id
    );
    const barAfter = await getCellxGeneSourceDatasetFromDatabase(
      CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_BAR.dataset_id
    );

    expect(fooAfter).toEqual(
      studyDatasetsAfter.find(
        (d) =>
          d.sd_info.cellxgeneDatasetId ===
          CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_FOO.dataset_id
      )
    );
    expect(barAfter).toEqual(
      studyDatasetsAfter.find(
        (d) =>
          d.sd_info.cellxgeneDatasetId ===
          CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_BAR.dataset_id
      )
    );

    await query("DELETE FROM hat.source_datasets WHERE id=ANY($1)", [
      [fooAfter?.id, barAfter?.id],
    ]);
    await restoreDbStudy(SOURCE_STUDY_DRAFT_OK);
  });

  it("deletes CELLxGENE datasets, updating linked entities, when source study is PUT requested with CELLxGENE ID removed", async () => {
    const studyDatasetsBefore = await getStudySourceDatasets(
      SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id
    );

    const atlasBefore = await getAtlasFromDatabase(
      ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B.id
    );
    const componentAtlasBefore = await getComponentAtlasFromDatabase(
      COMPONENT_ATLAS_WITH_CELLXGENE_DATASETS.id
    );

    expect(studyDatasetsBefore).toHaveLength(3);

    const fooBefore = await getCellxGeneSourceDatasetFromDatabase(
      CELLXGENE_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO.dataset_id
    );
    const barBefore = await getCellxGeneSourceDatasetFromDatabase(
      CELLXGENE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR.dataset_id
    );

    expect(fooBefore).toEqual(
      studyDatasetsBefore.find(
        (d) =>
          d.sd_info.cellxgeneDatasetId ===
          CELLXGENE_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO.dataset_id
      )
    );
    expect(barBefore).toEqual(
      studyDatasetsBefore.find(
        (d) =>
          d.sd_info.cellxgeneDatasetId ===
          CELLXGENE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR.dataset_id
      )
    );

    const res = await doStudyRequest(
      ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B.id,
      SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);

    const updatedStudy = res._getJSONData() as HCAAtlasTrackerSourceStudy;

    expect(updatedStudy.sourceDatasetCount).toEqual(1);

    const studyDatasetsAfter = await getStudySourceDatasets(
      SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id
    );

    expect(studyDatasetsAfter).toHaveLength(1);
    expect(studyDatasetsAfter[0].id).toEqual(
      SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAZ.id
    );

    const fooAfter = await getCellxGeneSourceDatasetFromDatabase(
      CELLXGENE_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO.dataset_id
    );
    const barAfter = await getCellxGeneSourceDatasetFromDatabase(
      CELLXGENE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR.dataset_id
    );

    expect(fooAfter).toBeNull();
    expect(barAfter).toBeNull();

    expect(
      await getSourceDatasetFromDatabase(
        SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE.id
      )
    ).toBeTruthy();

    const atlasAfter = await getAtlasFromDatabase(
      ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B.id
    );
    const componentAtlasAfter = await getComponentAtlasFromDatabase(
      COMPONENT_ATLAS_WITH_CELLXGENE_DATASETS.id
    );

    if (
      !(
        expectIsDefined(atlasBefore) &&
        expectIsDefined(atlasAfter) &&
        expectIsDefined(componentAtlasBefore) &&
        expectIsDefined(componentAtlasAfter)
      )
    ) {
      return;
    }
    expectAtlasDatasetsToHaveDifference(atlasAfter, atlasBefore, [
      SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO,
    ]);
    expectComponentAtlasDatasetsToHaveDifference(
      componentAtlasAfter,
      componentAtlasBefore,
      [SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR]
    );

    await initSourceDatasets(undefined, [
      SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO,
      SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR,
    ]);
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

    const datasetsBefore = await getSourceDatasetsFromDatabase(
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

    const datasetsAfter = await getSourceDatasetsFromDatabase(
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

  it("deletes source study entirely, including validations and source datasets, when only in one atlas", async () => {
    const validationsBefore = await getValidationsByEntityId(
      SOURCE_STUDY_DRAFT_OK.id
    );
    expect(validationsBefore).not.toHaveLength(0);

    const datasetsBefore = await getSourceDatasetsFromDatabase(
      SOURCE_STUDY_DRAFT_OK.id
    );
    expect(datasetsBefore).toHaveLength(2);

    await expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_DRAFT_OK.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);
    const draftStudies = (await getAtlasFromDatabase(ATLAS_DRAFT.id))
      ?.source_studies;
    expect(draftStudies).not.toContain(SOURCE_STUDY_DRAFT_OK.id);
    const studyFromDb = await getSourceStudyFromDatabase(
      SOURCE_STUDY_DRAFT_OK.id
    );
    expect(studyFromDb).toBeUndefined();

    const validationsAfter = await getValidationsByEntityId(
      SOURCE_STUDY_DRAFT_OK.id
    );
    expect(validationsAfter).toHaveLength(0);

    const datasetsAfter = await getSourceDatasetsFromDatabase(
      SOURCE_STUDY_DRAFT_OK.id
    );
    expect(datasetsAfter).toHaveLength(0);
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
    expect(draftStudies).not.toContain(SOURCE_STUDY_DRAFT_OK.id);
    const studyFromDb = await getSourceStudyFromDatabase(
      SOURCE_STUDY_DRAFT_OK.id
    );
    expect(studyFromDb).toBeUndefined();
  });

  it("updates component atlas that had relevent source datasets when source study is deleted", async () => {
    const caMiscFooBefore = await getExistingComponentAtlasFromDatabase(
      COMPONENT_ATLAS_MISC_FOO.id
    );
    const caDraftFooBefore = await getExistingComponentAtlasFromDatabase(
      COMPONENT_ATLAS_DRAFT_FOO.id
    );

    await expect(
      (
        await doStudyRequest(
          ATLAS_WITH_MISC_SOURCE_STUDIES.id,
          SOURCE_STUDY_WITH_OTHER_SOURCE_DATASETS.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);

    const caMiscFooAfter = await getExistingComponentAtlasFromDatabase(
      COMPONENT_ATLAS_MISC_FOO.id
    );
    const caDraftFooAfter = await getExistingComponentAtlasFromDatabase(
      COMPONENT_ATLAS_DRAFT_FOO.id
    );

    expectComponentAtlasDatasetsToHaveDifference(
      caMiscFooAfter,
      caMiscFooBefore,
      [SOURCE_DATASET_OTHER_FOO, SOURCE_DATASET_OTHER_BAR]
    );

    expect(caDraftFooAfter).toEqual(caDraftFooBefore);
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
    studyFromDb.study_info.metadataSpreadsheets.map((sheet) => sheet.url)
  ).toEqual(editData.metadataSpreadsheets.map((sheet) => sheet.url));
}

async function expectStudyToBeUnchanged(study: TestSourceStudy): Promise<void> {
  const studyFromDb = await getStudyFromDatabase(study.id);
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

async function getSourceDatasetFromDatabase(
  sourceDatasetId: string | undefined
): Promise<HCAAtlasTrackerDBSourceDataset> {
  return (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE id=$1",
      [sourceDatasetId]
    )
  ).rows[0];
}

async function getSourceDatasetsFromDatabase(
  sourceStudyId: string
): Promise<HCAAtlasTrackerDBSourceDataset[]> {
  return (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE source_study_id=$1",
      [sourceStudyId]
    )
  ).rows;
}

async function getStudyFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBSourceStudy | undefined> {
  return (
    await query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies WHERE id=$1",
      [id]
    )
  ).rows[0];
}
