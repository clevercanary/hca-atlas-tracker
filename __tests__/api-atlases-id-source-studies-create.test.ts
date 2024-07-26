import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerSourceStudy,
  PublicationInfo,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import createHandler from "../pages/api/atlases/[atlasId]/source-studies/create";
import {
  ATLAS_DRAFT,
  ATLAS_NONEXISTENT,
  ATLAS_PUBLIC,
  CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_BAR,
  CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_FOO,
  CELLXGENE_ID_JOURNAL_COUNTERPART,
  CELLXGENE_ID_NORMAL,
  CELLXGENE_ID_PREPRINT_COUNTERPART,
  CELLXGENE_ID_WITH_NEW_SOURCE_DATASETS,
  DOI_DRAFT_OK,
  DOI_JOURNAL_WITH_PREPRINT_COUNTERPART,
  DOI_NORMAL,
  DOI_PREPRINT_NO_JOURNAL,
  DOI_PREPRINT_WITH_JOURNAL_COUNTERPART,
  DOI_PUBLIC_WITH_JOURNAL_JOURNAL,
  DOI_PUBLIC_WITH_PREPRINT_PREPRINT,
  DOI_UNSUPPORTED_TYPE,
  DOI_WITH_NEW_SOURCE_DATASETS,
  HCA_ID_JOURNAL_COUNTERPART,
  HCA_ID_NORMAL,
  HCA_ID_PREPRINT_COUNTERPART,
  PUBLICATION_DRAFT_OK,
  PUBLICATION_JOURNAL_WITH_PREPRINT_COUNTERPART,
  PUBLICATION_NORMAL,
  PUBLICATION_PREPRINT_NO_JOURNAL,
  PUBLICATION_PREPRINT_WITH_JOURNAL_COUNTERPART,
  PUBLICATION_PUBLIC_WITH_JOURNAL,
  PUBLICATION_PUBLIC_WITH_PREPRINT,
  SOURCE_STUDY_DRAFT_OK,
  SOURCE_STUDY_PUBLIC_WITH_JOURNAL,
  SOURCE_STUDY_PUBLIC_WITH_PREPRINT,
  STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD,
  USER_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  getCellxGeneSourceDatasetFromDatabase,
  getStudySourceDatasets,
  getValidationsByEntityId,
  resetDatabase,
} from "../testing/db-utils";
import { TestAtlas, TestUser } from "../testing/entities";
import {
  expectApiValidationsToMatchDb,
  expectSourceStudyToMatch,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");

const TEST_ROUTE = "/api/atlases/[atlasId]/source-studies/create";

const NEW_STUDY_DATA = {
  doi: DOI_NORMAL,
};

const NEW_STUDY_PREPRINT_NO_JOURNAL_DATA = {
  doi: DOI_PREPRINT_NO_JOURNAL,
};

const NEW_STUDY_UNSUPPORTED_TYPE_DATA = {
  doi: DOI_UNSUPPORTED_TYPE,
};

const NEW_STUDY_PREPRINT_WITH_JOURNAL_COUNTERPART_DATA = {
  doi: DOI_PREPRINT_WITH_JOURNAL_COUNTERPART,
};

const NEW_STUDY_JOURNAL_WITH_PREPRINT_COUNTERPART_DATA = {
  doi: DOI_JOURNAL_WITH_PREPRINT_COUNTERPART,
};

const NEW_STUDY_UNPUBLISHED_DATA = {
  contactEmail: "foo@example.com",
  referenceAuthor: "Foo",
  title: "Something",
};

const NEW_STUDY_DRAFT_OK = {
  doi: DOI_DRAFT_OK,
};

const NEW_STUDY_PUBLIC_WITH_PREPRINT_PREPRINT = {
  doi: DOI_PUBLIC_WITH_PREPRINT_PREPRINT,
};

const NEW_STUDY_PUBLIC_WITH_JOURNAL_JOURNAL = {
  doi: DOI_PUBLIC_WITH_JOURNAL_JOURNAL,
};

const NEW_STUDY_EMPTY_STRING_CONTACT_EMAIL = {
  contactEmail: "",
  referenceAuthor: "Bar",
  title: "Something Bar",
};

const NEW_STUDY_NULL_CONTACT_EMAIL = {
  contactEmail: null,
  referenceAuthor: "Baz",
  title: "Something Baz",
};

const NEW_STUDY_WITH_NEW_SOURCE_DATASETS = {
  doi: DOI_WITH_NEW_SOURCE_DATASETS,
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
        await doCreateTest(undefined, ATLAS_DRAFT, NEW_STUDY_DATA, false, "GET")
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (
        await doCreateTest(undefined, ATLAS_DRAFT, NEW_STUDY_DATA)
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCreateTest(USER_UNREGISTERED, ATLAS_DRAFT, NEW_STUDY_DATA)
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
      getQueryValues(ATLAS_DRAFT),
      NEW_STUDY_DATA,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(403);
      }
    );
  }

  it("returns error 403 for logged in user with INTEGRATION_LEAD role for another atlas", async () => {
    expect(
      (
        await doCreateTest(USER_UNREGISTERED, ATLAS_DRAFT, NEW_STUDY_DATA)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 404 when specified atlas doesn't exist", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_NONEXISTENT,
          NEW_STUDY_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns error 400 when doi is not a string", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_DRAFT,
          {
            ...NEW_STUDY_DATA,
            doi: 123,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when doi is empty string", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_DRAFT,
          {
            ...NEW_STUDY_DATA,
            doi: "",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when doi is syntactically invalid", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_DRAFT,
          {
            ...NEW_STUDY_DATA,
            doi: "10.nota/doi",
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 for crossref work with unsupported type", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_DRAFT,
          NEW_STUDY_UNSUPPORTED_TYPE_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates, validates, and returns source study entry, including validations, for journal publication", async () => {
    const { apiStudy, dbStudy } = await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_STUDY_DATA,
      PUBLICATION_NORMAL,
      HCA_ID_NORMAL,
      CELLXGENE_ID_NORMAL
    );
    const validations = await getValidationsByEntityId(dbStudy.id);
    expect(validations).not.toHaveLength(0);
    expectApiValidationsToMatchDb(apiStudy.validations, validations);
  });

  it("creates and returns source study entry for preprint without journal value", async () => {
    await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_STUDY_PREPRINT_NO_JOURNAL_DATA,
      PUBLICATION_PREPRINT_NO_JOURNAL,
      null,
      null
    );
  });

  it("creates and returns source study entry for preprint with journal article counterpart on HCA/CELLxGENE", async () => {
    await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_STUDY_PREPRINT_WITH_JOURNAL_COUNTERPART_DATA,
      PUBLICATION_PREPRINT_WITH_JOURNAL_COUNTERPART,
      HCA_ID_JOURNAL_COUNTERPART,
      CELLXGENE_ID_JOURNAL_COUNTERPART
    );
  });

  it("creates and returns source study entry for journal article with preprint counterpart on HCA/CELLxGENE", async () => {
    await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_STUDY_JOURNAL_WITH_PREPRINT_COUNTERPART_DATA,
      PUBLICATION_JOURNAL_WITH_PREPRINT_COUNTERPART,
      HCA_ID_PREPRINT_COUNTERPART,
      CELLXGENE_ID_PREPRINT_COUNTERPART
    );
  });

  it("returns error 400 when both published and unpublished fields are present", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_DRAFT,
          {
            ...NEW_STUDY_DATA,
            ...NEW_STUDY_UNPUBLISHED_DATA,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when unpublished fields are incomplete", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_DRAFT,
          {
            ...NEW_STUDY_UNPUBLISHED_DATA,
            contactEmail: undefined,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when contact email is undefined", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_DRAFT,
          {
            ...NEW_STUDY_UNPUBLISHED_DATA,
            contactEmail: undefined,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error on DOI field when source study already exists in the atlas", async () => {
    const res = await doCreateTest(
      USER_CONTENT_ADMIN,
      ATLAS_DRAFT,
      NEW_STUDY_DRAFT_OK,
      true
    );
    expect(res._getStatusCode()).toEqual(400);
    const errors = res._getJSONData();
    const doiErrors = errors.errors?.doi;
    expect(doiErrors).toBeDefined();
    expect(doiErrors).toHaveLength(1);
  });

  it("creates and returns entry for unpublished source study for user with INTEGRATION_LEAD role for the atlas", async () => {
    await testSuccessfulUnpublishedCreate(
      NEW_STUDY_UNPUBLISHED_DATA,
      undefined,
      USER_INTEGRATION_LEAD_DRAFT
    );
  });

  it("creates and returns entry for unpublished source study with empty string email", async () => {
    await testSuccessfulUnpublishedCreate(
      NEW_STUDY_EMPTY_STRING_CONTACT_EMAIL,
      {
        ...NEW_STUDY_EMPTY_STRING_CONTACT_EMAIL,
        contactEmail: null,
      }
    );
  });

  it("creates and returns entry for unpublished source study with null email", async () => {
    await testSuccessfulUnpublishedCreate(NEW_STUDY_NULL_CONTACT_EMAIL);
  });

  it("adds, revalidates, and returns source study that already exists", async () => {
    const validationsBefore = await getValidationsByEntityId(
      SOURCE_STUDY_DRAFT_OK.id
    );
    expect(validationsBefore).not.toHaveLength(0);
    expect(validationsBefore[0].atlas_ids).toHaveLength(1);
    expect(validationsBefore[0].atlas_ids[0]).toEqual(ATLAS_DRAFT.id);
    const { dbStudy } = await testSuccessfulCreate(
      ATLAS_PUBLIC,
      NEW_STUDY_DRAFT_OK,
      PUBLICATION_DRAFT_OK,
      null,
      null
    );
    expect(dbStudy.id).toEqual(SOURCE_STUDY_DRAFT_OK.id);
    const validationsAfter = await getValidationsByEntityId(
      SOURCE_STUDY_DRAFT_OK.id
    );
    expect(validationsAfter[0].atlas_ids).toHaveLength(2);
    expect(validationsAfter[0].atlas_ids).toContain(ATLAS_PUBLIC.id);
  });

  it("adds and returns source study that already exists via preprint DOI", async () => {
    const { dbStudy } = await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_STUDY_PUBLIC_WITH_PREPRINT_PREPRINT,
      PUBLICATION_PUBLIC_WITH_PREPRINT,
      null,
      null
    );
    expect(dbStudy.id).toEqual(SOURCE_STUDY_PUBLIC_WITH_PREPRINT.id);
  });

  it("adds and returns source study that already exists via journal DOI", async () => {
    const { dbStudy } = await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_STUDY_PUBLIC_WITH_JOURNAL_JOURNAL,
      PUBLICATION_PUBLIC_WITH_JOURNAL,
      null,
      null
    );
    expect(dbStudy.id).toEqual(SOURCE_STUDY_PUBLIC_WITH_JOURNAL.id);
  });

  it("updates CELLxGENE source datasets with source study is created", async () => {
    const fooBefore = await getCellxGeneSourceDatasetFromDatabase(
      CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_FOO.dataset_id
    );
    const barBefore = await getCellxGeneSourceDatasetFromDatabase(
      CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_BAR.dataset_id
    );

    expect(fooBefore).toBeNull();
    expect(barBefore).toBeNull();

    const { apiStudy } = await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_STUDY_WITH_NEW_SOURCE_DATASETS,
      null,
      null,
      CELLXGENE_ID_WITH_NEW_SOURCE_DATASETS
    );

    expect(apiStudy.sourceDatasetCount).toEqual(2);

    const studyDatasets = await getStudySourceDatasets(apiStudy.id);

    expect(studyDatasets).toHaveLength(2);

    const fooAfter = await getCellxGeneSourceDatasetFromDatabase(
      CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_FOO.dataset_id
    );
    const barAfter = await getCellxGeneSourceDatasetFromDatabase(
      CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_BAR.dataset_id
    );

    expect(fooAfter).toEqual(
      studyDatasets.find(
        (d) =>
          d.sd_info.cellxgeneDatasetId ===
          CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_FOO.dataset_id
      )
    );
    expect(barAfter).toEqual(
      studyDatasets.find(
        (d) =>
          d.sd_info.cellxgeneDatasetId ===
          CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_BAR.dataset_id
      )
    );
  });
});

async function testSuccessfulCreate(
  atlas: TestAtlas,
  newData: Record<string, unknown>,
  expectedPublication: PublicationInfo | null,
  expectedHcaId: string | null,
  expectedCellxGeneId: string | null
): Promise<{
  apiStudy: HCAAtlasTrackerSourceStudy;
  dbStudy: HCAAtlasTrackerDBSourceStudy;
}> {
  const res = await doCreateTest(USER_CONTENT_ADMIN, atlas, newData);
  expect(res._getStatusCode()).toEqual(201);
  const newStudy: HCAAtlasTrackerSourceStudy = res._getJSONData();
  const { source_studies: atlasStudies } = (
    await query<HCAAtlasTrackerDBAtlas>(
      "SELECT source_studies FROM hat.atlases WHERE id=$1",
      [atlas.id]
    )
  ).rows[0];
  expect(atlasStudies).toContain(newStudy.id);
  const newStudyFromDb = (
    await query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies WHERE id=$1",
      [newStudy.id]
    )
  ).rows[0];
  expectDbStudyToMatch(
    newStudyFromDb,
    newStudy,
    expectedPublication,
    expectedHcaId,
    expectedCellxGeneId
  );
  return {
    apiStudy: newStudy,
    dbStudy: newStudyFromDb,
  };
}

async function testSuccessfulUnpublishedCreate(
  newData: Record<string, unknown>,
  expectedUnpublishedInfo = newData,
  user = USER_CONTENT_ADMIN
): Promise<HCAAtlasTrackerDBSourceStudy> {
  const res = await doCreateTest(user, ATLAS_DRAFT, newData);
  expect(res._getStatusCode()).toEqual(201);
  const newStudy: HCAAtlasTrackerSourceStudy = res._getJSONData();
  expect(newStudy.contactEmail).toEqual(expectedUnpublishedInfo.contactEmail);
  expect(newStudy.referenceAuthor).toEqual(
    expectedUnpublishedInfo.referenceAuthor
  );
  expect(newStudy.title).toEqual(expectedUnpublishedInfo.title);
  const newStudyFromDb = (
    await query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies WHERE id=$1",
      [newStudy.id]
    )
  ).rows[0];
  expect(newStudyFromDb).toBeDefined();
  expect(newStudyFromDb.study_info.unpublishedInfo).toEqual(
    expectedUnpublishedInfo
  );
  return newStudyFromDb;
}

async function doCreateTest(
  user: TestUser | undefined,
  atlas: Pick<TestAtlas, "id">,
  newData: Record<string, unknown>,
  hideConsoleError = false,
  method: "GET" | "POST" = "POST"
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: newData,
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlas),
  });
  await withConsoleErrorHiding(() => createHandler(req, res), hideConsoleError);
  return res;
}

function getQueryValues(atlas: Pick<TestAtlas, "id">): Record<string, string> {
  return { atlasId: atlas.id };
}

function expectDbStudyToMatch(
  dbStudy: HCAAtlasTrackerDBSourceStudy,
  apiStudy: HCAAtlasTrackerSourceStudy,
  publication: PublicationInfo | null,
  hcaId: string | null,
  cellxgeneId: string | null
): void {
  expect(dbStudy).toBeDefined();
  expect(dbStudy.study_info.publication).toEqual(publication);
  expect(dbStudy.study_info.hcaProjectId).toEqual(hcaId);
  expect(dbStudy.study_info.cellxgeneCollectionId).toEqual(cellxgeneId);
  expectSourceStudyToMatch(dbStudy, apiStudy);
}
