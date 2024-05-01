import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerSourceDataset,
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
  USER_NORMAL,
} from "../testing/constants";
import { TestAtlas, TestUser } from "../testing/entities";

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

const newDatasetIds: string[] = [];

afterAll(async () => {
  await query("DELETE FROM hat.source_datasets WHERE id=ANY($1)", [
    newDatasetIds,
  ]);
  await query("UPDATE hat.atlases SET source_datasets=$1 WHERE id=$2", [
    JSON.stringify(ATLAS_DRAFT.sourceDatasets),
    ATLAS_DRAFT.id,
  ]);
  await query("UPDATE hat.atlases SET source_datasets=$1 WHERE id=$2", [
    JSON.stringify(ATLAS_PUBLIC.sourceDatasets),
    ATLAS_PUBLIC.id,
  ]);
  endPgPool();
});

describe("/api/atlases/[atlasId]/source-datasets/create", () => {
  it("returns error 405 for non-POST request", async () => {
    expect(
      (
        await doCreateTest(undefined, ATLAS_DRAFT, NEW_DATASET_DATA, "GET")
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

  it("returns error 403 for logged in user without CONTENT_ADMIN role", async () => {
    expect(
      (
        await doCreateTest(USER_NORMAL, ATLAS_DRAFT, NEW_DATASET_DATA)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 404 when specified atlas doesn't exist", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_NONEXISTENT,
          NEW_DATASET_DATA
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns error 400 when doi is not a string", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, ATLAS_DRAFT, {
          ...NEW_DATASET_DATA,
          doi: 123,
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when doi is empty string", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, ATLAS_DRAFT, {
          ...NEW_DATASET_DATA,
          doi: "",
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when doi is syntactically invalid", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, ATLAS_DRAFT, {
          ...NEW_DATASET_DATA,
          doi: "10.nota/doi",
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 for crossref work with unsupported type", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_DRAFT,
          NEW_DATASET_UNSUPPORTED_TYPE_DATA
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates and returns source dataset entry for journal publication", async () => {
    await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_DATASET_DATA,
      PUBLICATION_NORMAL,
      HCA_ID_NORMAL,
      CELLXGENE_ID_NORMAL
    );
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
        await doCreateTest(USER_CONTENT_ADMIN, ATLAS_DRAFT, {
          ...NEW_DATASET_DATA,
          ...NEW_DATASET_UNPUBLISHED_DATA,
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when unpublished fields are incomplete", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, ATLAS_DRAFT, {
          ...NEW_DATASET_UNPUBLISHED_DATA,
          contactEmail: undefined,
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when contact email is empty string", async () => {
    expect(
      (
        await doCreateTest(USER_CONTENT_ADMIN, ATLAS_DRAFT, {
          ...NEW_DATASET_UNPUBLISHED_DATA,
          contactEmail: "",
        })
      )._getStatusCode()
    ).toEqual(400);
  });

  it("creates and returns entry for unpublished source dataset", async () => {
    const res = await doCreateTest(
      USER_CONTENT_ADMIN,
      ATLAS_DRAFT,
      NEW_DATASET_UNPUBLISHED_DATA
    );
    expect(res._getStatusCode()).toEqual(201);
    const newDataset: HCAAtlasTrackerSourceDataset = res._getJSONData();
    newDatasetIds.push(newDataset.id);
    expect(newDataset.contactEmail).toEqual(
      NEW_DATASET_UNPUBLISHED_DATA.contactEmail
    );
    expect(newDataset.referenceAuthor).toEqual(
      NEW_DATASET_UNPUBLISHED_DATA.referenceAuthor
    );
    expect(newDataset.title).toEqual(NEW_DATASET_UNPUBLISHED_DATA.title);
    const newDatasetFromDb = (
      await query<HCAAtlasTrackerDBSourceDataset>(
        "SELECT * FROM hat.source_datasets WHERE id=$1",
        [newDataset.id]
      )
    ).rows[0];
    expect(newDatasetFromDb).toBeDefined();
    expect(newDatasetFromDb.sd_info.unpublishedInfo).toEqual(
      NEW_DATASET_UNPUBLISHED_DATA
    );
  });

  it("returns error on DOI field when source dataset already exists in the atlas", async () => {
    const res = await doCreateTest(
      USER_CONTENT_ADMIN,
      ATLAS_DRAFT,
      NEW_DATASET_DRAFT_OK
    );
    expect(res._getStatusCode()).toEqual(400);
    const errors = res._getJSONData();
    const doiErrors = errors.errors?.doi;
    expect(doiErrors).toBeDefined();
    expect(doiErrors).toHaveLength(1);
  });

  it("adds and returns source dataset that already exists", async () => {
    const dbDataset = await testSuccessfulCreate(
      ATLAS_PUBLIC,
      NEW_DATASET_DRAFT_OK,
      PUBLICATION_DRAFT_OK,
      null,
      null,
      false
    );
    expect(dbDataset.id).toEqual(SOURCE_DATASET_DRAFT_OK.id);
  });

  it("adds and returns source dataset that already exists via preprint DOI", async () => {
    const dbDataset = await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_DATASET_PUBLIC_WITH_PREPRINT_PREPRINT,
      PUBLICATION_PUBLIC_WITH_PREPRINT,
      null,
      null,
      false
    );
    expect(dbDataset.id).toEqual(SOURCE_DATASET_PUBLIC_WITH_PREPRINT.id);
  });

  it("adds and returns source dataset that already exists via journal DOI", async () => {
    const dbDataset = await testSuccessfulCreate(
      ATLAS_DRAFT,
      NEW_DATASET_PUBLIC_WITH_JOURNAL_JOURNAL,
      PUBLICATION_PUBLIC_WITH_JOURNAL,
      null,
      null,
      false
    );
    expect(dbDataset.id).toEqual(SOURCE_DATASET_PUBLIC_WITH_JOURNAL.id);
  });
});

async function testSuccessfulCreate(
  atlas: TestAtlas,
  newData: Record<string, unknown>,
  expectedPublication: PublicationInfo,
  expectedHcaId: string | null,
  expectedCellxGeneId: string | null,
  isNew = true
): Promise<HCAAtlasTrackerDBSourceDataset> {
  const res = await doCreateTest(USER_CONTENT_ADMIN, atlas, newData);
  expect(res._getStatusCode()).toEqual(201);
  const newDataset: HCAAtlasTrackerSourceDataset = res._getJSONData();
  if (isNew) newDatasetIds.push(newDataset.id);
  const { source_datasets: atlasDatasets } = (
    await query<HCAAtlasTrackerDBAtlas>(
      "SELECT source_datasets FROM hat.atlases WHERE id=$1",
      [atlas.id]
    )
  ).rows[0];
  expect(atlasDatasets).toContain(newDataset.id);
  const newDatasetFromDb = (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE id=$1",
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

async function doCreateTest(
  user: TestUser | undefined,
  atlas: Pick<TestAtlas, "id">,
  newData: Record<string, unknown>,
  method: "GET" | "POST" = "POST"
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: newData,
    headers: { authorization: user?.authorization },
    method,
    query: { atlasId: atlas.id },
  });
  await createHandler(req, res);
  return res;
}

function expectDbDatasetToMatch(
  dbDataset: HCAAtlasTrackerDBSourceDataset,
  apiDataset: HCAAtlasTrackerSourceDataset,
  publication: PublicationInfo,
  hcaId: string | null,
  cellxgeneId: string | null
): void {
  expect(dbDataset).toBeDefined();
  expect(dbDataset.sd_info.publication).toEqual(publication);
  expect(dbDataset.sd_info.hcaProjectId).toEqual(hcaId);
  expect(dbDataset.sd_info.cellxgeneCollectionId).toEqual(cellxgeneId);
  expect(dbSourceDatasetToApiSourceDataset(dbDataset)).toEqual(apiDataset);
}
