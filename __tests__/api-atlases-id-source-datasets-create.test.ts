import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerSourceDataset,
  PublicationInfo,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { NewSourceDatasetData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbSourceDatasetToApiSourceDataset } from "../app/apis/catalog/hca-atlas-tracker/common/utils";
import { endPgPool, query } from "../app/utils/api-handler";
import createHandler from "../pages/api/atlases/[atlasId]/source-datasets/create";
import {
  ATLAS_DRAFT,
  ATLAS_NONEXISTENT,
  CELLXGENE_ID_NORMAL,
  DOI_NORMAL,
  DOI_PREPRINT_NO_JOURNAL,
  DOI_UNSUPPORTED_TYPE,
  HCA_ID_NORMAL,
  PUBLICATION_NORMAL,
  PUBLICATION_PREPRINT_NO_JOURNAL,
  USER_CONTENT_ADMIN,
  USER_NORMAL,
} from "../testing/constants";
import { TestAtlas, TestUser } from "../testing/entities";

jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");

const NEW_DATASET_DATA: NewSourceDatasetData = {
  doi: DOI_NORMAL,
};

const NEW_DATASET_PREPRINT_NO_JOURNAL_DATA = {
  doi: DOI_PREPRINT_NO_JOURNAL,
};

const NEW_DATASET_UNSUPPORTED_TYPE_DATA = {
  doi: DOI_UNSUPPORTED_TYPE,
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
          doi: 123 as unknown as NewSourceDatasetData["doi"],
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

  it("returns error 500 for crossref work with unsupported type", async () => {
    expect(
      (
        await doCreateTest(
          USER_CONTENT_ADMIN,
          ATLAS_DRAFT,
          NEW_DATASET_UNSUPPORTED_TYPE_DATA
        )
      )._getStatusCode()
    ).toEqual(500);
  });

  it("creates and returns source dataset entry for journal publication", async () => {
    const res = await doCreateTest(
      USER_CONTENT_ADMIN,
      ATLAS_DRAFT,
      NEW_DATASET_DATA
    );
    expect(res._getStatusCode()).toEqual(201);
    const newDataset: HCAAtlasTrackerSourceDataset = res._getJSONData();
    newDatasetIds.push(newDataset.id);
    const newDatasetFromDb = (
      await query<HCAAtlasTrackerDBSourceDataset>(
        "SELECT * FROM hat.source_datasets WHERE id=$1",
        [newDataset.id]
      )
    ).rows[0];
    expectDbDatasetToMatch(
      newDatasetFromDb,
      newDataset,
      PUBLICATION_NORMAL,
      HCA_ID_NORMAL,
      CELLXGENE_ID_NORMAL
    );
  });

  it("creates and returns source dataset entry for preprint without journal value", async () => {
    const res = await doCreateTest(
      USER_CONTENT_ADMIN,
      ATLAS_DRAFT,
      NEW_DATASET_PREPRINT_NO_JOURNAL_DATA
    );
    expect(res._getStatusCode()).toEqual(201);
    const newDataset: HCAAtlasTrackerSourceDataset = res._getJSONData();
    newDatasetIds.push(newDataset.id);
    const newDatasetFromDb = (
      await query<HCAAtlasTrackerDBSourceDataset>(
        "SELECT * FROM hat.source_datasets WHERE id=$1",
        [newDataset.id]
      )
    ).rows[0];
    expectDbDatasetToMatch(
      newDatasetFromDb,
      newDataset,
      PUBLICATION_PREPRINT_NO_JOURNAL,
      null,
      null
    );
  });
});

async function doCreateTest(
  user: TestUser | undefined,
  atlas: Pick<TestAtlas, "id">,
  newData: NewSourceDatasetData,
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
