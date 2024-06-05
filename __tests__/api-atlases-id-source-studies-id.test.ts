import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerSourceStudy,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { dbSourceStudyToApiSourceStudy } from "../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import studyHandler from "../pages/api/atlases/[atlasId]/source-studies/[sourceStudyId]";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  DOI_PREPRINT_NO_JOURNAL,
  PUBLICATION_PREPRINT_NO_JOURNAL,
  SOURCE_STUDY_DRAFT_OK,
  SOURCE_STUDY_PUBLIC_NO_CROSSREF,
  SOURCE_STUDY_SHARED,
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { getValidationsByEntityId, resetDatabase } from "../testing/db-utils";
import {
  TestPublishedSourceStudy,
  TestSourceStudy,
  TestUser,
} from "../testing/entities";
import {
  makeTestSourceStudyOverview,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");

const SOURCE_STUDY_PUBLIC_NO_CROSSREF_EDIT = {
  capId: null,
  doi: DOI_PREPRINT_NO_JOURNAL,
};

const SOURCE_STUDY_DRAFT_OK_EDIT = {
  contactEmail: "bar@example.com",
  referenceAuthor: "Bar",
  title: "Baz",
};

const SOURCE_STUDY_DRAFT_OK_CAP_ID_EDIT = {
  capId: "cap-id-source-study-draft-ok-edit",
  doi: SOURCE_STUDY_DRAFT_OK.doi,
};

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("/api/atlases/[atlasId]/source-studies/[sourceStudyId]", () => {
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

  it("returns error 401 when study is requested from public atlas by logged out user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id
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
          USER_UNREGISTERED
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 401 when study is GET requested from draft atlas by logged out user", async () => {
    expect(
      (
        await doStudyRequest(ATLAS_DRAFT.id, SOURCE_STUDY_DRAFT_OK.id)
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when study is GET requested from draft atlas by unregistered user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_DRAFT_OK.id,
          USER_UNREGISTERED
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

  it("returns study from public atlas when GET requested by logged in user with STAKEHOLDER role", async () => {
    const res = await doStudyRequest(
      ATLAS_PUBLIC.id,
      SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
      USER_STAKEHOLDER
    );
    expect(res._getStatusCode()).toEqual(200);
    const study = res._getJSONData() as HCAAtlasTrackerSourceStudy;
    expect(study.doi).toEqual(SOURCE_STUDY_PUBLIC_NO_CROSSREF.doi);
  });

  it("returns study from draft atlas when GET requested by logged in user with STAKEHOLDER role", async () => {
    const res = await doStudyRequest(
      ATLAS_DRAFT.id,
      SOURCE_STUDY_DRAFT_OK.id,
      USER_STAKEHOLDER
    );
    expect(res._getStatusCode()).toEqual(200);
    const study = res._getJSONData() as HCAAtlasTrackerSourceStudy;
    expect(study.doi).toEqual(SOURCE_STUDY_DRAFT_OK.doi);
  });

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

  it("returns error 401 when study is PUT requested from public atlas by logged out user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          undefined,
          METHOD.PUT,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF_EDIT
        )
      )._getStatusCode()
    ).toEqual(401);
    expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
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
    expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("returns error 403 when study is PUT requested from public atlas by logged in user with STAKEHOLDER role", async () => {
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
    expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
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
    expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("returns error 400 for study PUT requested with contact email set to undefined", async () => {
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
    expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("updates, revalidates, and returns study with published data when PUT requested", async () => {
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
    const updatedStudy = res._getJSONData();
    const studyFromDb = await getStudyFromDatabase(updatedStudy.id);
    expect(studyFromDb).toBeDefined();
    if (!studyFromDb) return;
    expect(studyFromDb.study_info.publication).toEqual(
      PUBLICATION_PREPRINT_NO_JOURNAL
    );
    expect(studyFromDb.study_info.hcaProjectId).toEqual(null);
    expect(studyFromDb.study_info.cellxgeneCollectionId).toEqual(null);
    expect(dbSourceStudyToApiSourceStudy(studyFromDb)).toEqual(updatedStudy);

    const validationsAfter = await getValidationsByEntityId(
      SOURCE_STUDY_PUBLIC_NO_CROSSREF.id
    );
    expect(validationsAfter).not.toHaveLength(0);
    expect(validationsAfter[0].validation_info.doi).toEqual(
      SOURCE_STUDY_PUBLIC_NO_CROSSREF_EDIT.doi
    );

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
    expect(studyFromDb.doi).toEqual(null);
    expect(studyFromDb.study_info.unpublishedInfo).toEqual(
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

  it("returns error 401 when study is DELETE requested from public atlas by logged out user", async () => {
    expect(
      (
        await doStudyRequest(
          ATLAS_PUBLIC.id,
          SOURCE_STUDY_PUBLIC_NO_CROSSREF.id,
          undefined,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(401);
    expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
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
    expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("returns error 403 when study is DELETE requested from public atlas by logged in user with STAKEHOLDER role", async () => {
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
    expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
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
    expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);
  });

  it("deletes source study only from specified atlas and revalidates when shared by multiple atlases", async () => {
    const validationsBefore = await getValidationsByEntityId(
      SOURCE_STUDY_SHARED.id
    );
    expect(validationsBefore).not.toHaveLength(0);
    expect(validationsBefore[0].atlas_ids).toHaveLength(2);

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
    expectStudyToBeUnchanged(SOURCE_STUDY_PUBLIC_NO_CROSSREF);

    const validationsAfter = await getValidationsByEntityId(
      SOURCE_STUDY_SHARED.id
    );
    expect(validationsAfter).not.toHaveLength(0);
    expect(validationsAfter[0].atlas_ids).toHaveLength(1);

    await query("UPDATE hat.atlases SET source_studies=$1 WHERE id=$2", [
      JSON.stringify(ATLAS_DRAFT.sourceStudies),
      ATLAS_DRAFT.id,
    ]);
  });

  it("deletes source study entirely, including validations, when only in one atlas", async () => {
    const validationsBefore = await getValidationsByEntityId(
      SOURCE_STUDY_DRAFT_OK.id
    );
    expect(validationsBefore).not.toHaveLength(0);

    expect(
      (
        await doStudyRequest(
          ATLAS_DRAFT.id,
          SOURCE_STUDY_DRAFT_OK.id,
          USER_CONTENT_ADMIN,
          METHOD.DELETE
        )
      )._getStatusCode()
    ).toEqual(200);
    const draftStudys = (await getAtlasFromDatabase(ATLAS_DRAFT.id))
      ?.source_studies;
    expect(draftStudys).not.toContain(SOURCE_STUDY_DRAFT_OK.id);
    const studyQueryResult = await query(
      "SELECT * FROM hat.source_studies WHERE id=$1",
      [SOURCE_STUDY_DRAFT_OK.id]
    );
    expect(studyQueryResult.rows[0]).toBeUndefined();

    const validationsAfter = await getValidationsByEntityId(
      SOURCE_STUDY_DRAFT_OK.id
    );
    expect(validationsAfter).toHaveLength(0);

    await query(
      "INSERT INTO hat.source_studies (doi, id, study_info) VALUES ($1, $2, $3)",
      [
        SOURCE_STUDY_DRAFT_OK.doi,
        SOURCE_STUDY_DRAFT_OK.id,
        JSON.stringify(makeTestSourceStudyOverview(SOURCE_STUDY_DRAFT_OK)),
      ]
    );
    await query("UPDATE hat.atlases SET source_studies=$1 WHERE id=$2", [
      JSON.stringify(ATLAS_DRAFT.sourceStudies),
      ATLAS_DRAFT.id,
    ]);
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
    query: { atlasId, sourceStudyId },
  });
  await withConsoleErrorHiding(() => studyHandler(req, res), hideConsoleError);
  return res;
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

async function expectStudyToBeUnchanged(
  study: TestPublishedSourceStudy
): Promise<void> {
  const studyFromDb = await getStudyFromDatabase(study.id);
  expect(studyFromDb).toBeDefined();
  if (!studyFromDb) return;
  expect(studyFromDb.doi).toEqual(study.doi);
  expect(studyFromDb.study_info.doiStatus).toEqual(study.doiStatus);
  expect(studyFromDb.study_info.publication).toEqual(study.publication);
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
