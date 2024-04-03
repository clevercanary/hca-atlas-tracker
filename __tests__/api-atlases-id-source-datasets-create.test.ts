import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerDBSourceDataset } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { NewSourceDatasetData } from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import { endPgPool, query } from "../app/utils/api-handler";
import createHandler from "../pages/api/atlases/[atlasId]/source-datasets/create";
import {
  ATLAS_DRAFT,
  ATLAS_NONEXISTENT,
  DOI_NORMAL,
  PUBLICATION_NORMAL,
  USER_CONTENT_ADMIN,
  USER_NORMAL,
} from "../testing/constants";
import { TestAtlas, TestUser } from "../testing/entities";

jest.mock("../app/utils/pg-connect-config");
jest.mock("../app/utils/publications");

const NEW_DATASET_DATA: NewSourceDatasetData = {
  doi: DOI_NORMAL,
};

let newDatasetId: string;

afterAll(async () => {
  await query("DELETE FROM hat.source_datasets WHERE id=$1", [newDatasetId]);
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

  it("creates and returns source dataset entry", async () => {
    const newDataset: HCAAtlasTrackerDBSourceDataset = (
      await doCreateTest(USER_CONTENT_ADMIN, ATLAS_DRAFT, NEW_DATASET_DATA)
    )._getJSONData();
    newDatasetId = newDataset.id;
    expect(newDataset.sd_info.publication).toEqual(PUBLICATION_NORMAL);
    const newDatasetFromDb = (
      await query<HCAAtlasTrackerDBSourceDataset>(
        "SELECT * FROM hat.source_datasets WHERE id=$1",
        [newDataset.id]
      )
    ).rows[0];
    expect(newDatasetFromDb).toBeDefined();
    expect(newDatasetFromDb.sd_info.publication).toEqual(PUBLICATION_NORMAL);
    expect(newDatasetFromDb.created_at.toISOString()).toEqual(
      newDataset.created_at
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
