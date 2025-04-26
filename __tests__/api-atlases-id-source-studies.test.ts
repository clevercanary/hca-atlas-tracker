import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerSourceStudy } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import studiesHandler from "../pages/api/atlases/[atlasId]/source-studies";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  SOURCE_STUDY_DRAFT_NO_CROSSREF,
  SOURCE_STUDY_DRAFT_OK,
  SOURCE_STUDY_PUBLIC_NO_CROSSREF,
  SOURCE_STUDY_SHARED,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  expectApiSourceStudyToHaveMatchingDbValidations,
  resetDatabase,
} from "../testing/db-utils";
import { TestPublishedSourceStudy, TestUser } from "../testing/entities";
import { testApiRole, withConsoleErrorHiding } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

const TEST_ROUTE = "/api/atlases/[id]/source-studies";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (
        await doStudiesRequest(ATLAS_PUBLIC.id, undefined, METHOD.POST)
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when public atlas studies are requested by logged out user", async () => {
    expect(
      (
        await doStudiesRequest(ATLAS_PUBLIC.id, undefined, METHOD.GET, true)
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when public atlas studies are requested by unregistered user", async () => {
    expect(
      (
        await doStudiesRequest(
          ATLAS_PUBLIC.id,
          USER_UNREGISTERED,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when public atlas studies are requested by disabled user", async () => {
    expect(
      (
        await doStudiesRequest(ATLAS_PUBLIC.id, USER_DISABLED_CONTENT_ADMIN)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 401 when draft atlas studies are requested by logged out user", async () => {
    expect(
      (
        await doStudiesRequest(ATLAS_DRAFT.id, undefined, METHOD.GET, true)
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when draft atlas studies are requested by unregistered user", async () => {
    expect(
      (
        await doStudiesRequest(
          ATLAS_DRAFT.id,
          USER_UNREGISTERED,
          METHOD.GET,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when draft atlas studies are requested by disabled user", async () => {
    expect(
      (
        await doStudiesRequest(ATLAS_DRAFT.id, USER_DISABLED_CONTENT_ADMIN)
      )._getStatusCode()
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns public atlas studies",
      TEST_ROUTE,
      studiesHandler,
      METHOD.GET,
      role,
      getQueryValues(ATLAS_PUBLIC.id),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const studies = res._getJSONData() as HCAAtlasTrackerSourceStudy[];
        expect(studies).toHaveLength(2);
        expectStudyPropertiesToMatch(
          studies.find((d) => d.id === SOURCE_STUDY_PUBLIC_NO_CROSSREF.id),
          SOURCE_STUDY_PUBLIC_NO_CROSSREF
        );
        expectStudyPropertiesToMatch(
          studies.find((d) => d.id === SOURCE_STUDY_SHARED.id),
          SOURCE_STUDY_SHARED
        );
      }
    );

    testApiRole(
      "returns draft atlas studies",
      TEST_ROUTE,
      studiesHandler,
      METHOD.GET,
      role,
      getQueryValues(ATLAS_DRAFT.id),
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const studies = res._getJSONData() as HCAAtlasTrackerSourceStudy[];
        expect(studies).toHaveLength(3);
        expectStudyPropertiesToMatch(
          studies.find((d) => d.id === SOURCE_STUDY_DRAFT_OK.id),
          SOURCE_STUDY_DRAFT_OK
        );
        expectStudyPropertiesToMatch(
          studies.find((d) => d.id === SOURCE_STUDY_SHARED.id),
          SOURCE_STUDY_SHARED
        );
        expectStudyPropertiesToMatch(
          studies.find((d) => d.id === SOURCE_STUDY_DRAFT_NO_CROSSREF.id),
          SOURCE_STUDY_DRAFT_NO_CROSSREF
        );
      }
    );
  }

  it("returns draft atlas studies, including validations, when requested by logged in user with CONTENT_ADMIN role", async () => {
    const res = await doStudiesRequest(ATLAS_DRAFT.id, USER_CONTENT_ADMIN);
    expect(res._getStatusCode()).toEqual(200);
    const studies = res._getJSONData() as HCAAtlasTrackerSourceStudy[];
    expect(studies).toHaveLength(3);
    expectStudyPropertiesToMatch(
      studies.find((d) => d.id === SOURCE_STUDY_DRAFT_OK.id),
      SOURCE_STUDY_DRAFT_OK
    );
    expectStudyPropertiesToMatch(
      studies.find((d) => d.id === SOURCE_STUDY_SHARED.id),
      SOURCE_STUDY_SHARED
    );
    expectStudyPropertiesToMatch(
      studies.find((d) => d.id === SOURCE_STUDY_DRAFT_NO_CROSSREF.id),
      SOURCE_STUDY_DRAFT_NO_CROSSREF
    );
    for (const study of studies) {
      await expectApiSourceStudyToHaveMatchingDbValidations(study);
    }
  });
});

async function doStudiesRequest(
  atlasId: string,
  user?: TestUser,
  method = METHOD.GET,
  hideConsoleError = false
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId),
  });
  await withConsoleErrorHiding(
    () => studiesHandler(req, res),
    hideConsoleError
  );
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}

function expectStudyPropertiesToMatch(
  apiStudy: HCAAtlasTrackerSourceStudy | undefined,
  testStudy: TestPublishedSourceStudy
): void {
  expect(apiStudy).toBeDefined();
  if (!apiStudy) return;
  expect(apiStudy.id).toEqual(testStudy.id);
  expect(apiStudy.doi).toEqual(testStudy.doi);
  expect(apiStudy.doiStatus).toEqual(testStudy.doiStatus);
  if (testStudy.publication) {
    expect(apiStudy.title).toEqual(testStudy.publication.title);
    expect(apiStudy.journal).toEqual(testStudy.publication.journal);
    expect(apiStudy.publicationDate).toEqual(
      testStudy.publication.publicationDate
    );
    expect(apiStudy.referenceAuthor).toEqual(
      testStudy.publication.authors[0]?.name
    );
  } else {
    expect(apiStudy.title).toBeNull();
    expect(apiStudy.journal).toBeNull();
    expect(apiStudy.publicationDate).toBeNull();
    expect(apiStudy.referenceAuthor).toBeNull();
  }
}
