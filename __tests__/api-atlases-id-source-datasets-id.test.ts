import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerSourceDataset,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { dbSourceDatasetToApiSourceDataset } from "../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import datasetHandler from "../pages/api/atlases/[atlasId]/source-datasets/[sdId]";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  DOI_PREPRINT_NO_JOURNAL,
  PUBLICATION_PREPRINT_NO_JOURNAL,
  SOURCE_DATASET_DRAFT_OK,
  SOURCE_DATASET_PUBLIC_NO_CROSSREF,
  USER_CONTENT_ADMIN,
  USER_NORMAL,
} from "../testing/constants";
import { TestSourceDataset, TestUser } from "../testing/entities";
import { makeTestSourceDatasetOverview } from "../testing/utils";

jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");

const SOURCE_DATASET_PUBLIC_NO_CROSSREF_EDIT = {
  doi: DOI_PREPRINT_NO_JOURNAL,
};

const SOURCE_DATASET_DRAFT_OK_EDIT = {
  contactEmail: "bar@example.com",
  referenceAuthor: "Bar",
  title: "Baz",
};

afterAll(async () => {
  await query("UPDATE hat.source_datasets SET doi=$1, sd_info=$2 WHERE id=$3", [
    SOURCE_DATASET_PUBLIC_NO_CROSSREF.doi,
    JSON.stringify(
      makeTestSourceDatasetOverview(SOURCE_DATASET_PUBLIC_NO_CROSSREF)
    ),
    SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
  ]);
  await query("UPDATE hat.source_datasets SET doi=$1, sd_info=$2 WHERE id=$3", [
    SOURCE_DATASET_DRAFT_OK.doi,
    JSON.stringify(makeTestSourceDatasetOverview(SOURCE_DATASET_DRAFT_OK)),
    SOURCE_DATASET_DRAFT_OK.id,
  ]);
  endPgPool();
});

describe("/api/atlases/[id]", () => {
  it("returns error 405 for non-GET, non-PUT request", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_PUBLIC.id,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
          undefined,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns dataset from public atlas when GET requested by logged out user", async () => {
    const res = await doDatasetRequest(
      ATLAS_PUBLIC.id,
      SOURCE_DATASET_PUBLIC_NO_CROSSREF.id
    );
    expect(res._getStatusCode()).toEqual(200);
    const dataset = res._getJSONData() as HCAAtlasTrackerSourceDataset;
    expect(dataset.doi).toEqual(SOURCE_DATASET_PUBLIC_NO_CROSSREF.doi);
  });

  it("returns dataset from public atlas when GET requested by logged in user without CONTENT_ADMIN role", async () => {
    const res = await doDatasetRequest(
      ATLAS_PUBLIC.id,
      SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
      USER_NORMAL
    );
    expect(res._getStatusCode()).toEqual(200);
    const dataset = res._getJSONData() as HCAAtlasTrackerSourceDataset;
    expect(dataset.doi).toEqual(SOURCE_DATASET_PUBLIC_NO_CROSSREF.doi);
  });

  it("returns error 404 when dataset is GET requested by user without CONTENT_ADMIN role via public atlas it doesn't exist on", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_PUBLIC.id,
          SOURCE_DATASET_DRAFT_OK.id,
          USER_NORMAL
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns error 401 when dataset is GET requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doDatasetRequest(ATLAS_DRAFT.id, SOURCE_DATASET_DRAFT_OK.id)
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when dataset is GET requested from draft atlas by logged in user without CONTENT_ADMIN role", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_DRAFT.id,
          SOURCE_DATASET_DRAFT_OK.id,
          USER_NORMAL
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 404 when dataset is GET requested by user with CONTENT_ADMIN role via atlas it doesn't exist on", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_DRAFT.id,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
          USER_CONTENT_ADMIN
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns dataset from draft atlas when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doDatasetRequest(
      ATLAS_DRAFT.id,
      SOURCE_DATASET_DRAFT_OK.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const dataset = res._getJSONData() as HCAAtlasTrackerSourceDataset;
    expect(dataset.doi).toEqual(SOURCE_DATASET_DRAFT_OK.doi);
  });

  it("returns error 401 when dataset is PUT requested from public atlas by logged out user", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_PUBLIC.id,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
          undefined,
          METHOD.PUT,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF_EDIT
        )
      )._getStatusCode()
    ).toEqual(401);
    expectDatasetToBeUnchanged(SOURCE_DATASET_PUBLIC_NO_CROSSREF);
  });

  it("returns error 403 when dataset is PUT requested from public atlas by logged in user without CONTENT_ADMIN role", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_PUBLIC.id,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
          USER_NORMAL,
          METHOD.PUT,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    expectDatasetToBeUnchanged(SOURCE_DATASET_PUBLIC_NO_CROSSREF);
  });

  it("returns error 404 when dataset is PUT requested from atlas it doesn't exist on", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_DRAFT.id,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF_EDIT
        )
      )._getStatusCode()
    ).toEqual(404);
    expectDatasetToBeUnchanged(SOURCE_DATASET_PUBLIC_NO_CROSSREF);
  });

  it("returns error 400 for dataset PUT requested with contact email set to empty string", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_DRAFT.id,
          SOURCE_DATASET_DRAFT_OK.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          {
            ...SOURCE_DATASET_DRAFT_OK_EDIT,
            contactEmail: "",
          }
        )
      )._getStatusCode()
    ).toEqual(400);
    expectDatasetToBeUnchanged(SOURCE_DATASET_PUBLIC_NO_CROSSREF);
  });

  it("updates and returns dataset with published data when PUT requested", async () => {
    const res = await doDatasetRequest(
      ATLAS_PUBLIC.id,
      SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      SOURCE_DATASET_PUBLIC_NO_CROSSREF_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedDataset = res._getJSONData();
    const datasetFromDb = await getDatasetFromDatabase(updatedDataset.id);
    expect(datasetFromDb).toBeDefined();
    if (!datasetFromDb) return;
    expect(datasetFromDb.sd_info.publication).toEqual(
      PUBLICATION_PREPRINT_NO_JOURNAL
    );
    expect(datasetFromDb.sd_info.hcaProjectId).toEqual(null);
    expect(datasetFromDb.sd_info.cellxgeneCollectionId).toEqual(null);
    expect(dbSourceDatasetToApiSourceDataset(datasetFromDb)).toEqual(
      updatedDataset
    );
  });

  it("updates and returns dataset with unpublished data when PUT requested", async () => {
    const res = await doDatasetRequest(
      ATLAS_DRAFT.id,
      SOURCE_DATASET_DRAFT_OK.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      SOURCE_DATASET_DRAFT_OK_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedDataset = res._getJSONData();
    const datasetFromDb = await getDatasetFromDatabase(updatedDataset.id);
    expect(datasetFromDb).toBeDefined();
    if (!datasetFromDb) return;
    expect(datasetFromDb.doi).toEqual(null);
    expect(datasetFromDb.sd_info.unpublishedInfo).toEqual(
      SOURCE_DATASET_DRAFT_OK_EDIT
    );
  });
});

async function doDatasetRequest(
  atlasId: string,
  sdId: string,
  user?: TestUser,
  method = METHOD.GET,
  updatedData?: Record<string, unknown>
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: updatedData,
    headers: { authorization: user?.authorization },
    method,
    query: { atlasId, sdId },
  });
  await datasetHandler(req, res);
  return res;
}

async function expectDatasetToBeUnchanged(
  dataset: TestSourceDataset
): Promise<void> {
  const datasetFromDb = await getDatasetFromDatabase(dataset.id);
  expect(datasetFromDb).toBeDefined();
  if (!datasetFromDb) return;
  expect(datasetFromDb.doi).toEqual(dataset.doi);
  expect(datasetFromDb.sd_info.doiStatus).toEqual(dataset.doiStatus);
  expect(datasetFromDb.sd_info.publication).toEqual(dataset.publication);
}

async function getDatasetFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBSourceDataset | undefined> {
  return (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE id=$1",
      [id]
    )
  ).rows[0];
}
