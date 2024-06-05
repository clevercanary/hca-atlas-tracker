import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerSourceStudy,
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
  SOURCE_DATASET_SHARED,
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { getValidationsByEntityId, resetDatabase } from "../testing/db-utils";
import {
  TestPublishedSourceDataset,
  TestSourceDataset,
  TestUser,
} from "../testing/entities";
import {
  makeTestSourceDatasetOverview,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");

const SOURCE_DATASET_PUBLIC_NO_CROSSREF_EDIT = {
  capId: null,
  doi: DOI_PREPRINT_NO_JOURNAL,
};

const SOURCE_DATASET_DRAFT_OK_EDIT = {
  contactEmail: "bar@example.com",
  referenceAuthor: "Bar",
  title: "Baz",
};

const SOURCE_DATASET_DRAFT_OK_CAP_ID_EDIT = {
  capId: "cap-id-source-dataset-draft-ok-edit",
  doi: SOURCE_DATASET_DRAFT_OK.doi,
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("/api/atlases/[atlasId]/source-datasets/[sdId]", () => {
  it("returns error 405 for POST request", async () => {
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

  it("returns error 401 when dataset is requested from public atlas by logged out user", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_PUBLIC.id,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF.id
        )
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when dataset is requested from public atlas by unregistered user", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_PUBLIC.id,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
          USER_UNREGISTERED
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 401 when dataset is GET requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doDatasetRequest(ATLAS_DRAFT.id, SOURCE_DATASET_DRAFT_OK.id)
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when dataset is GET requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_DRAFT.id,
          SOURCE_DATASET_DRAFT_OK.id,
          USER_UNREGISTERED
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
          USER_CONTENT_ADMIN,
          undefined,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
  });

  it("returns dataset from public atlas when GET requested by logged in user with STAKEHOLDER role", async () => {
    const res = await doDatasetRequest(
      ATLAS_PUBLIC.id,
      SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
      USER_STAKEHOLDER
    );
    expect(res._getStatusCode()).toEqual(200);
    const dataset = res._getJSONData() as HCAAtlasTrackerSourceStudy;
    expect(dataset.doi).toEqual(SOURCE_DATASET_PUBLIC_NO_CROSSREF.doi);
  });

  it("returns dataset from draft atlas when GET requested by logged in user with STAKEHOLDER role", async () => {
    const res = await doDatasetRequest(
      ATLAS_DRAFT.id,
      SOURCE_DATASET_DRAFT_OK.id,
      USER_STAKEHOLDER
    );
    expect(res._getStatusCode()).toEqual(200);
    const dataset = res._getJSONData() as HCAAtlasTrackerSourceStudy;
    expect(dataset.doi).toEqual(SOURCE_DATASET_DRAFT_OK.doi);
  });

  it("returns dataset from draft atlas when GET requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doDatasetRequest(
      ATLAS_DRAFT.id,
      SOURCE_DATASET_DRAFT_OK.id,
      USER_CONTENT_ADMIN
    );
    expect(res._getStatusCode()).toEqual(200);
    const dataset = res._getJSONData() as HCAAtlasTrackerSourceStudy;
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

  it("returns error 403 when dataset is PUT requested from public atlas by unregistered user", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_PUBLIC.id,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
          USER_STAKEHOLDER,
          METHOD.PUT,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF_EDIT
        )
      )._getStatusCode()
    ).toEqual(403);
    expectDatasetToBeUnchanged(SOURCE_DATASET_PUBLIC_NO_CROSSREF);
  });

  it("returns error 403 when dataset is PUT requested from public atlas by logged in user with STAKEHOLDER role", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_PUBLIC.id,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
          USER_STAKEHOLDER,
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
          SOURCE_DATASET_PUBLIC_NO_CROSSREF_EDIT,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    expectDatasetToBeUnchanged(SOURCE_DATASET_PUBLIC_NO_CROSSREF);
  });

  it("returns error 400 for dataset PUT requested with contact email set to undefined", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_DRAFT.id,
          SOURCE_DATASET_DRAFT_OK.id,
          USER_CONTENT_ADMIN,
          METHOD.PUT,
          {
            ...SOURCE_DATASET_DRAFT_OK_EDIT,
            contactEmail: undefined,
          },
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    expectDatasetToBeUnchanged(SOURCE_DATASET_PUBLIC_NO_CROSSREF);
  });

  it("updates, revalidates, and returns dataset with published data when PUT requested", async () => {
    const validationsBefore = await getValidationsByEntityId(
      SOURCE_DATASET_PUBLIC_NO_CROSSREF.id
    );
    expect(validationsBefore).not.toHaveLength(0);
    expect(validationsBefore[0].validation_info.doi).toEqual(
      SOURCE_DATASET_PUBLIC_NO_CROSSREF.doi
    );

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
    expect(datasetFromDb.study_info.publication).toEqual(
      PUBLICATION_PREPRINT_NO_JOURNAL
    );
    expect(datasetFromDb.study_info.hcaProjectId).toEqual(null);
    expect(datasetFromDb.study_info.cellxgeneCollectionId).toEqual(null);
    expect(dbSourceDatasetToApiSourceDataset(datasetFromDb)).toEqual(
      updatedDataset
    );

    const validationsAfter = await getValidationsByEntityId(
      SOURCE_DATASET_PUBLIC_NO_CROSSREF.id
    );
    expect(validationsAfter).not.toHaveLength(0);
    expect(validationsAfter[0].validation_info.doi).toEqual(
      SOURCE_DATASET_PUBLIC_NO_CROSSREF_EDIT.doi
    );

    await restoreDbDataset(SOURCE_DATASET_PUBLIC_NO_CROSSREF);
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
    expect(datasetFromDb.study_info.unpublishedInfo).toEqual(
      SOURCE_DATASET_DRAFT_OK_EDIT
    );

    await restoreDbDataset(SOURCE_DATASET_DRAFT_OK);
  });

  it("updates and returns dataset with CAP ID when PUT requested", async () => {
    const res = await doDatasetRequest(
      ATLAS_DRAFT.id,
      SOURCE_DATASET_DRAFT_OK.id,
      USER_CONTENT_ADMIN,
      METHOD.PUT,
      SOURCE_DATASET_DRAFT_OK_CAP_ID_EDIT
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedDataset = res._getJSONData() as HCAAtlasTrackerSourceStudy;
    expect(updatedDataset.capId).toEqual(
      SOURCE_DATASET_DRAFT_OK_CAP_ID_EDIT.capId
    );
    const datasetFromDb = await getDatasetFromDatabase(updatedDataset.id);
    expect(datasetFromDb).toBeDefined();
    if (!datasetFromDb) return;
    expect(datasetFromDb.study_info.capId).toEqual(
      SOURCE_DATASET_DRAFT_OK_CAP_ID_EDIT.capId
    );

    await restoreDbDataset(SOURCE_DATASET_DRAFT_OK);
  });

  it("returns error 401 when dataset is DELETE requested from public atlas by logged out user", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_PUBLIC.id,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
          undefined,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(401);
    expectDatasetToBeUnchanged(SOURCE_DATASET_PUBLIC_NO_CROSSREF);
  });

  it("returns error 403 when dataset is DELETE requested from public atlas by unregistered user", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_PUBLIC.id,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
          USER_STAKEHOLDER,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    expectDatasetToBeUnchanged(SOURCE_DATASET_PUBLIC_NO_CROSSREF);
  });

  it("returns error 403 when dataset is DELETE requested from public atlas by logged in user with STAKEHOLDER role", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_PUBLIC.id,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
          USER_STAKEHOLDER,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(403);
    expectDatasetToBeUnchanged(SOURCE_DATASET_PUBLIC_NO_CROSSREF);
  });

  it("returns error 404 when dataset is DELETE requested from atlas it doesn't exist on", async () => {
    expect(
      (
        await doDatasetRequest(
          ATLAS_DRAFT.id,
          SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE,
          undefined,
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    expectDatasetToBeUnchanged(SOURCE_DATASET_PUBLIC_NO_CROSSREF);
  });

  it("deletes source dataset only from specified atlas and revalidates when shared by multiple atlases", async () => {
    const validationsBefore = await getValidationsByEntityId(
      SOURCE_DATASET_SHARED.id
    );
    expect(validationsBefore).not.toHaveLength(0);
    expect(validationsBefore[0].atlas_ids).toHaveLength(2);

    expect(
      (
        await doDatasetRequest(
          ATLAS_DRAFT.id,
          SOURCE_DATASET_SHARED.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);
    const draftDatasets = (await getAtlasFromDatabase(ATLAS_DRAFT.id))
      ?.source_studies;
    expect(draftDatasets).not.toContain(SOURCE_DATASET_SHARED.id);
    const publicDatasets = (await getAtlasFromDatabase(ATLAS_PUBLIC.id))
      ?.source_studies;
    expect(publicDatasets).toContain(SOURCE_DATASET_SHARED.id);
    expectDatasetToBeUnchanged(SOURCE_DATASET_PUBLIC_NO_CROSSREF);

    const validationsAfter = await getValidationsByEntityId(
      SOURCE_DATASET_SHARED.id
    );
    expect(validationsAfter).not.toHaveLength(0);
    expect(validationsAfter[0].atlas_ids).toHaveLength(1);

    await query("UPDATE hat.atlases SET source_studies=$1 WHERE id=$2", [
      JSON.stringify(ATLAS_DRAFT.sourceDatasets),
      ATLAS_DRAFT.id,
    ]);
  });

  it("deletes source dataset entirely, including validations, when only in one atlas", async () => {
    const validationsBefore = await getValidationsByEntityId(
      SOURCE_DATASET_DRAFT_OK.id
    );
    expect(validationsBefore).not.toHaveLength(0);

    expect(
      (
        await doDatasetRequest(
          ATLAS_DRAFT.id,
          SOURCE_DATASET_DRAFT_OK.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);
    const draftDatasets = (await getAtlasFromDatabase(ATLAS_DRAFT.id))
      ?.source_studies;
    expect(draftDatasets).not.toContain(SOURCE_DATASET_DRAFT_OK.id);
    const datasetQueryResult = await query(
      "SELECT * FROM hat.source_studies WHERE id=$1",
      [SOURCE_DATASET_DRAFT_OK.id]
    );
    expect(datasetQueryResult.rows[0]).toBeUndefined();

    const validationsAfter = await getValidationsByEntityId(
      SOURCE_DATASET_DRAFT_OK.id
    );
    expect(validationsAfter).toHaveLength(0);

    await query(
      "INSERT INTO hat.source_studies (doi, id, study_info) VALUES ($1, $2, $3)",
      [
        SOURCE_DATASET_DRAFT_OK.doi,
        SOURCE_DATASET_DRAFT_OK.id,
        JSON.stringify(makeTestSourceDatasetOverview(SOURCE_DATASET_DRAFT_OK)),
      ]
    );
    await query("UPDATE hat.atlases SET source_studies=$1 WHERE id=$2", [
      JSON.stringify(ATLAS_DRAFT.sourceDatasets),
      ATLAS_DRAFT.id,
    ]);
  });
});

async function doDatasetRequest(
  atlasId: string,
  sdId: string,
  user?: TestUser,
  method = METHOD.GET,
  updatedData?: Record<string, unknown>,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: updatedData,
    headers: { authorization: user?.authorization },
    method,
    query: { atlasId, sdId },
  });
  await withConsoleErrorHiding(
    () => datasetHandler(req, res),
    hideConsoleError
  );
  return res;
}

async function restoreDbDataset(dataset: TestSourceDataset): Promise<void> {
  await query(
    "UPDATE hat.source_studies SET doi=$1, study_info=$2 WHERE id=$3",
    [
      "doi" in dataset ? dataset.doi : null,
      JSON.stringify(makeTestSourceDatasetOverview(dataset)),
      dataset.id,
    ]
  );
}

async function expectDatasetToBeUnchanged(
  dataset: TestPublishedSourceDataset
): Promise<void> {
  const datasetFromDb = await getDatasetFromDatabase(dataset.id);
  expect(datasetFromDb).toBeDefined();
  if (!datasetFromDb) return;
  expect(datasetFromDb.doi).toEqual(dataset.doi);
  expect(datasetFromDb.study_info.doiStatus).toEqual(dataset.doiStatus);
  expect(datasetFromDb.study_info.publication).toEqual(dataset.publication);
}

async function getDatasetFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBSourceStudy | undefined> {
  return (
    await query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies WHERE id=$1",
      [id]
    )
  ).rows[0];
}

async function getAtlasFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBAtlas | undefined> {
  return (
    await query<HCAAtlasTrackerDBAtlas>(
      "SELECT * FROM hat.atlases WHERE id=$1",
      [id]
    )
  ).rows[0];
}
