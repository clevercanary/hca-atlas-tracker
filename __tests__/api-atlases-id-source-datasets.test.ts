import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerSourceDataset } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/utils/api-handler";
import datasetsHandler from "../pages/api/atlases/[atlasId]/source-datasets";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  SOURCE_DATASET_DRAFT_NO_CROSSREF,
  SOURCE_DATASET_DRAFT_OK,
  SOURCE_DATASET_PUBLIC_NO_CROSSREF,
  USER_CONTENT_ADMIN,
  USER_NORMAL,
} from "../testing/constants";
import { TestSourceDataset, TestUser } from "../testing/entities";

jest.mock("../app/utils/pg-app-connect-config");

afterAll(async () => {
  endPgPool();
});

describe("/api/atlases/[id]", () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (
        await doDatasetsRequest(ATLAS_PUBLIC.id, undefined, METHOD.POST)
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns public atlas datasets when requested by logged out user", async () => {
    const res = await doDatasetsRequest(ATLAS_PUBLIC.id);
    expect(res._getStatusCode()).toEqual(200);
    const datasets = res._getJSONData() as HCAAtlasTrackerSourceDataset[];
    expect(datasets).toHaveLength(1);
    expectDatasetPropertiesToMatch(
      datasets[0],
      SOURCE_DATASET_PUBLIC_NO_CROSSREF
    );
  });

  it("returns public atlas datasets when requested by logged in user without CONTENT_ADMIN role", async () => {
    const res = await doDatasetsRequest(ATLAS_PUBLIC.id);
    expect(res._getStatusCode()).toEqual(200);
    const datasets = res._getJSONData() as HCAAtlasTrackerSourceDataset[];
    expect(datasets).toHaveLength(1);
    expectDatasetPropertiesToMatch(
      datasets[0],
      SOURCE_DATASET_PUBLIC_NO_CROSSREF
    );
  });

  it("returns error 401 when draft atlas datasets are requested by logged out user", async () => {
    expect((await doDatasetsRequest(ATLAS_DRAFT.id))._getStatusCode()).toEqual(
      401
    );
  });

  it("returns error 403 when draft atlas datasets are requested by logged in user without CONTENT_ADMIN role", async () => {
    expect(
      (await doDatasetsRequest(ATLAS_DRAFT.id, USER_NORMAL))._getStatusCode()
    ).toEqual(403);
  });

  it("returns draft atlas datasets when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doDatasetsRequest(ATLAS_DRAFT.id, USER_CONTENT_ADMIN);
    expect(res._getStatusCode()).toEqual(200);
    const datasets = res._getJSONData() as HCAAtlasTrackerSourceDataset[];
    expect(datasets).toHaveLength(2);
    expectDatasetPropertiesToMatch(datasets[0], SOURCE_DATASET_DRAFT_OK);
    expectDatasetPropertiesToMatch(
      datasets[1],
      SOURCE_DATASET_DRAFT_NO_CROSSREF
    );
  });
});

async function doDatasetsRequest(
  atlasId: string,
  user?: TestUser,
  method = METHOD.GET
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: { atlasId },
  });
  await datasetsHandler(req, res);
  return res;
}

function expectDatasetPropertiesToMatch(
  apiDataset: HCAAtlasTrackerSourceDataset,
  testDataset: TestSourceDataset
): void {
  expect(apiDataset).toBeDefined();
  expect(apiDataset.id).toEqual(testDataset.id);
  expect(apiDataset.doi).toEqual(testDataset.doi);
  expect(apiDataset.doiStatus).toEqual(testDataset.doiStatus);
  if (testDataset.publication) {
    expect(apiDataset.title).toEqual(testDataset.publication.title);
    expect(apiDataset.journal).toEqual(testDataset.publication.journal);
    expect(apiDataset.publicationDate).toEqual(
      testDataset.publication.publicationDate
    );
    expect(apiDataset.referenceAuthor).toEqual(
      testDataset.publication.authors[0]?.name
    );
  } else {
    expect(apiDataset.title).toBeNull();
    expect(apiDataset.journal).toBeNull();
    expect(apiDataset.publicationDate).toBeNull();
    expect(apiDataset.referenceAuthor).toBeNull();
  }
}
