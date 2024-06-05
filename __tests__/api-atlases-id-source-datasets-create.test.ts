import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerSourceStudy,
  PublicationInfo,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { dbSourceDatasetToApiSourceDataset } from "../app/apis/catalog/hca-atlas-tracker/common/utils";
import { endPgPool, query } from "../app/services/database";
import createHandler from "../pages/api/atlases/[atlasId]/source-datasets/create";
import {
  ATLAS_DRAFT,
  ATLAS_NONEXISTENT,
  ATLAS_PUBLIC,
  CELLXGENE_ID_JOURNAL_COUNTERPART,
  CELLXGENE_ID_NORMAL,
  CELLXGENE_ID_PREPRINT_COUNTERPART,
  DOI_DRAFT_OK,
  DOI_JOURNAL_WITH_PREPRINT_COUNTERPART,
  DOI_NORMAL,
  DOI_PREPRINT_NO_JOURNAL,
  DOI_PREPRINT_WITH_JOURNAL_COUNTERPART,
  DOI_PUBLIC_WITH_JOURNAL_JOURNAL,
  DOI_PUBLIC_WITH_PREPRINT_PREPRINT,
  DOI_UNSUPPORTED_TYPE,
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
  SOURCE_DATASET_DRAFT_OK,
  SOURCE_DATASET_PUBLIC_WITH_JOURNAL,
  SOURCE_DATASET_PUBLIC_WITH_PREPRINT,
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { getValidationsByEntityId, resetDatabase } from "../testing/db-utils";
import { TestAtlas, TestUser } from "../testing/entities";
import { withConsoleErrorHiding } from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");

const NEW_DATASET_DATA = {
  doi: DOI_NORMAL,
};

const NEW_DATASET_PREPRINT_NO_JOURNAL_DATA = {
  doi: DOI_PREPRINT_NO_JOURNAL,
};

const NEW_DATASET_UNSUPPORTED_TYPE_DATA = {
  doi: DOI_UNSUPPORTED_TYPE,
};

const NEW_DATASET_PREPRINT_WITH_JOURNAL_COUNTERPART_DATA = {
  doi: DOI_PREPRINT_WITH_JOURNAL_COUNTERPART,
};

const NEW_DATASET_JOURNAL_WITH_PREPRINT_COUNTERPART_DATA = {
  doi: DOI_JOURNAL_WITH_PREPRINT_COUNTERPART,
};

const NEW_DATASET_UNPUBLISHED_DATA = {
  contactEmail: "foo@example.com",
  referenceAuthor: "Foo",
  title: "Something",
};

const NEW_DATASET_DRAFT_OK = {
  doi: DOI_DRAFT_OK,
};

const NEW_DATASET_PUBLIC_WITH_PREPRINT_PREPRINT = {
  doi: DOI_PUBLIC_WITH_PREPRINT_PREPRINT,
};

const NEW_DATASET_PUBLIC_WITH_JOURNAL_JOURNAL = {
  doi: DOI_PUBLIC_WITH_JOURNAL_JOURNAL,
};

const NEW_DATASET_EMPTY_STRING_CONTACT_EMAIL = {
  contactEmail: "",
  referenceAuthor: "Bar",
  title: "Something Bar",
};

const NEW_DATASET_NULL_CONTACT_EMAIL = {
  contactEmail: null,
  referenceAuthor: "Baz",
  title: "Something Baz",
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("/api/atlases/[atlasId]/source-datasets/create", () => {
  it("returns error 405 for non-POST request", async () => {
    expect(
      (
        await doCreateTest(
          undefined,
          ATLAS_DRAFT,
          NEW_DATASET_DATA,
          false,
          "GET"
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (
        await doCreateTest(undefined, ATLAS_DRAFT, NEW_DATASET_DATA)
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCreateTest(USER_UNREGISTERED, ATLAS_DRAFT, NEW_DATASET_DATA)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 for logged in user with STAKEHOLDER role", async () => {
    expect(
      (
        await doCreateTest(USER_STAKEHOLDER, ATLAS_DRAFT, NEW_DATASET_DATA)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 404 when specified atlas doesn't exist", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_NONEXISTENT,
          NEW_DATASET_DATA,
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
            ...NEW_DATASET_DATA,
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
            ...NEW_DATASET_DATA,
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
            ...NEW_DATASET_DATA,
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
          NEW_DATASET_UNSUPPORTED_TYPE_DATA,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates, validates, and returns source dataset entry for journal publication", async () => {
    const newDataset = await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_DATASET_DATA,
      PUBLICATION_NORMAL,
      HCA_ID_NORMAL,
      CELLXGENE_ID_NORMAL
    );
    const validations = await getValidationsByEntityId(newDataset.id);
    expect(validations).not.toHaveLength(0);
  });

  it("creates and returns source dataset entry for preprint without journal value", async () => {
    await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_DATASET_PREPRINT_NO_JOURNAL_DATA,
      PUBLICATION_PREPRINT_NO_JOURNAL,
      null,
      null
    );
  });

  it("creates and returns source dataset entry for preprint with journal article counterpart on HCA/CELLxGENE", async () => {
    await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_DATASET_PREPRINT_WITH_JOURNAL_COUNTERPART_DATA,
      PUBLICATION_PREPRINT_WITH_JOURNAL_COUNTERPART,
      HCA_ID_JOURNAL_COUNTERPART,
      CELLXGENE_ID_JOURNAL_COUNTERPART
    );
  });

  it("creates and returns source dataset entry for journal article with preprint counterpart on HCA/CELLxGENE", async () => {
    await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_DATASET_JOURNAL_WITH_PREPRINT_COUNTERPART_DATA,
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
            ...NEW_DATASET_DATA,
            ...NEW_DATASET_UNPUBLISHED_DATA,
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
            ...NEW_DATASET_UNPUBLISHED_DATA,
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
            ...NEW_DATASET_UNPUBLISHED_DATA,
            contactEmail: undefined,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates and returns entry for unpublished source dataset", async () => {
    await testSuccessfulUnpublishedCreate(NEW_DATASET_UNPUBLISHED_DATA);
  });

  it("creates and returns entry for unpublished source dataset with empty string email", async () => {
    await testSuccessfulUnpublishedCreate(
      NEW_DATASET_EMPTY_STRING_CONTACT_EMAIL,
      {
        ...NEW_DATASET_EMPTY_STRING_CONTACT_EMAIL,
        contactEmail: null,
      }
    );
  });

  it("creates and returns entry for unpublished source dataset with null email", async () => {
    await testSuccessfulUnpublishedCreate(NEW_DATASET_NULL_CONTACT_EMAIL);
  });

  it("returns error on DOI field when source dataset already exists in the atlas", async () => {
    const res = await doCreateTest(
      USER_CONTENT_ADMIN,
      ATLAS_DRAFT,
      NEW_DATASET_DRAFT_OK,
      true
    );
    expect(res._getStatusCode()).toEqual(400);
    const errors = res._getJSONData();
    const doiErrors = errors.errors?.doi;
    expect(doiErrors).toBeDefined();
    expect(doiErrors).toHaveLength(1);
  });

  it("adds, revalidates, and returns source dataset that already exists", async () => {
    const validationsBefore = await getValidationsByEntityId(
      SOURCE_DATASET_DRAFT_OK.id
    );
    expect(validationsBefore).not.toHaveLength(0);
    expect(validationsBefore[0].atlas_ids).toHaveLength(1);
    expect(validationsBefore[0].atlas_ids[0]).toEqual(ATLAS_DRAFT.id);
    const dbDataset = await testSuccessfulCreate(
      ATLAS_PUBLIC,
      NEW_DATASET_DRAFT_OK,
      PUBLICATION_DRAFT_OK,
      null,
      null
    );
    expect(dbDataset.id).toEqual(SOURCE_DATASET_DRAFT_OK.id);
    const validationsAfter = await getValidationsByEntityId(
      SOURCE_DATASET_DRAFT_OK.id
    );
    expect(validationsAfter[0].atlas_ids).toHaveLength(2);
    expect(validationsAfter[0].atlas_ids).toContain(ATLAS_PUBLIC.id);
  });

  it("adds and returns source dataset that already exists via preprint DOI", async () => {
    const dbDataset = await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_DATASET_PUBLIC_WITH_PREPRINT_PREPRINT,
      PUBLICATION_PUBLIC_WITH_PREPRINT,
      null,
      null
    );
    expect(dbDataset.id).toEqual(SOURCE_DATASET_PUBLIC_WITH_PREPRINT.id);
  });

  it("adds and returns source dataset that already exists via journal DOI", async () => {
    const dbDataset = await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_DATASET_PUBLIC_WITH_JOURNAL_JOURNAL,
      PUBLICATION_PUBLIC_WITH_JOURNAL,
      null,
      null
    );
    expect(dbDataset.id).toEqual(SOURCE_DATASET_PUBLIC_WITH_JOURNAL.id);
  });
});

async function testSuccessfulCreate(
  atlas: TestAtlas,
  newData: Record<string, unknown>,
  expectedPublication: PublicationInfo,
  expectedHcaId: string | null,
  expectedCellxGeneId: string | null
): Promise<HCAAtlasTrackerDBSourceStudy> {
  const res = await doCreateTest(USER_CONTENT_ADMIN, atlas, newData);
  expect(res._getStatusCode()).toEqual(201);
  const newDataset: HCAAtlasTrackerSourceStudy = res._getJSONData();
  const { source_studies: atlasDatasets } = (
    await query<HCAAtlasTrackerDBAtlas>(
      "SELECT source_studies FROM hat.atlases WHERE id=$1",
      [atlas.id]
    )
  ).rows[0];
  expect(atlasDatasets).toContain(newDataset.id);
  const newDatasetFromDb = (
    await query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies WHERE id=$1",
      [newDataset.id]
    )
  ).rows[0];
  expectDbDatasetToMatch(
    newDatasetFromDb,
    newDataset,
    expectedPublication,
    expectedHcaId,
    expectedCellxGeneId
  );
  return newDatasetFromDb;
}

async function testSuccessfulUnpublishedCreate(
  newData: Record<string, unknown>,
  expectedUnpublishedInfo = newData
): Promise<HCAAtlasTrackerDBSourceStudy> {
  const res = await doCreateTest(USER_CONTENT_ADMIN, ATLAS_DRAFT, newData);
  expect(res._getStatusCode()).toEqual(201);
  const newDataset: HCAAtlasTrackerSourceStudy = res._getJSONData();
  expect(newDataset.contactEmail).toEqual(expectedUnpublishedInfo.contactEmail);
  expect(newDataset.referenceAuthor).toEqual(
    expectedUnpublishedInfo.referenceAuthor
  );
  expect(newDataset.title).toEqual(expectedUnpublishedInfo.title);
  const newDatasetFromDb = (
    await query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies WHERE id=$1",
      [newDataset.id]
    )
  ).rows[0];
  expect(newDatasetFromDb).toBeDefined();
  expect(newDatasetFromDb.study_info.unpublishedInfo).toEqual(
    expectedUnpublishedInfo
  );
  return newDatasetFromDb;
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
    query: { atlasId: atlas.id },
  });
  await withConsoleErrorHiding(() => createHandler(req, res), hideConsoleError);
  return res;
}

function expectDbDatasetToMatch(
  dbDataset: HCAAtlasTrackerDBSourceStudy,
  apiDataset: HCAAtlasTrackerSourceStudy,
  publication: PublicationInfo,
  hcaId: string | null,
  cellxgeneId: string | null
): void {
  expect(dbDataset).toBeDefined();
  expect(dbDataset.study_info.publication).toEqual(publication);
  expect(dbDataset.study_info.hcaProjectId).toEqual(hcaId);
  expect(dbDataset.study_info.cellxgeneCollectionId).toEqual(cellxgeneId);
  expect(dbSourceDatasetToApiSourceDataset(dbDataset)).toEqual(apiDataset);
}
