import { HCAAtlasTrackerListEntrySheetValidation } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import entrySheetValidationsHandler from "../pages/api/atlases/[atlasId]/entry-sheet-validations";
import {
  ATLAS_NONEXISTENT,
  ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A,
  ENTRY_SHEET_VALIDATION_WITH_ERRORED_UPDATE,
  ENTRY_SHEET_VALIDATION_WITH_FAILED_UPDATE,
  ENTRY_SHEET_VALIDATION_WITH_UPDATE,
  SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_BAR,
  SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import {
  TestEntrySheetValidation,
  TestSourceStudy,
  TestUser,
} from "../testing/entities";
import {
  expectIsDefined,
  getTestSourceStudyCitation,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/utils/hca-validation-tools/hca-validation-tools-api");

jest.mock("next-auth");

const TEST_ROUTE = "/api/atlases/[atlasId]/entry-sheet-validations";

const EXPECTED_ENTRY_SHEET_VALIDATIONS_A = [
  ENTRY_SHEET_VALIDATION_WITH_UPDATE,
  ENTRY_SHEET_VALIDATION_WITH_ERRORED_UPDATE,
  ENTRY_SHEET_VALIDATION_WITH_FAILED_UPDATE,
];
// Source studies of the respective entry sheet validations from the above array
const EXPECTED_ENTRY_SHEET_STUDIES_A = [
  SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO,
  SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_BAR,
  SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_BAR,
];

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for POST request", async () => {
    expect(
      (
        await doEntrySheetValidationsRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
        )
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 when entry sheet validations are requested by logged out user", async () => {
    expect(
      (
        await doEntrySheetValidationsRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          undefined,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 when entry sheet validations are requested by unregistered user", async () => {
    expect(
      (
        await doEntrySheetValidationsRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          USER_UNREGISTERED,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 when entry sheet validations are requested by disabled user", async () => {
    expect(
      (
        await doEntrySheetValidationsRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 404 when entry sheet validations are requested from nonexistent atlas", async () => {
    expect(
      (
        await doEntrySheetValidationsRequest(
          ATLAS_NONEXISTENT.id,
          USER_CONTENT_ADMIN,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns entry sheet validations",
      TEST_ROUTE,
      entrySheetValidationsHandler,
      METHOD.GET,
      role,
      getQueryValues(ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id),
      undefined,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const validations =
          res._getJSONData() as HCAAtlasTrackerListEntrySheetValidation[];
        expectListEntrySheetValidationsToMatchTest(
          validations,
          EXPECTED_ENTRY_SHEET_VALIDATIONS_A,
          EXPECTED_ENTRY_SHEET_STUDIES_A,
        );
      },
    );
  }

  it("returns entry sheet validations when requested by content admin", async () => {
    const res = await doEntrySheetValidationsRequest(
      ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const validations =
      res._getJSONData() as HCAAtlasTrackerListEntrySheetValidation[];
    expectListEntrySheetValidationsToMatchTest(
      validations,
      EXPECTED_ENTRY_SHEET_VALIDATIONS_A,
      EXPECTED_ENTRY_SHEET_STUDIES_A,
    );
  });
});

function expectListEntrySheetValidationsToMatchTest(
  listValidations: HCAAtlasTrackerListEntrySheetValidation[],
  testValidations: TestEntrySheetValidation[],
  testSourceStudies: TestSourceStudy[],
): void {
  expect(listValidations).toHaveLength(testValidations.length);
  for (const [i, testValidation] of testValidations.entries()) {
    const testSourceStudy = testSourceStudies[i];
    const listValidation = listValidations.find(
      (v) => v.id === testValidation.id,
    );
    if (expectIsDefined(listValidation))
      expectListEntrySheetValidationToMatchTest(
        listValidation,
        testValidation,
        testSourceStudy,
      );
  }
}

function expectListEntrySheetValidationToMatchTest(
  listValidation: HCAAtlasTrackerListEntrySheetValidation,
  testValidation: TestEntrySheetValidation,
  testSourceStudy: TestSourceStudy,
): void {
  expect(listValidation.entrySheetId).toEqual(testValidation.entry_sheet_id);
  expect(listValidation.entrySheetTitle).toEqual(
    testValidation.entry_sheet_title,
  );
  expect(listValidation.id).toEqual(testValidation.id);
  expect(listValidation.lastSynced).toEqual(
    testValidation.last_synced.toISOString(),
  );
  expect(listValidation.lastUpdated).toEqual(testValidation.last_updated);
  expect(listValidation.sourceStudyId).toEqual(testValidation.source_study_id);
  expect(listValidation.validationSummary).toEqual(
    testValidation.validation_summary,
  );
  expect(listValidation.publicationString).toEqual(
    getTestSourceStudyCitation(testSourceStudy),
  );
}

async function doEntrySheetValidationsRequest(
  atlasId: string,
  user: TestUser | undefined,
  method: METHOD,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId),
  });
  await withConsoleErrorHiding(
    () => entrySheetValidationsHandler(req, res),
    hideConsoleError,
  );
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}
