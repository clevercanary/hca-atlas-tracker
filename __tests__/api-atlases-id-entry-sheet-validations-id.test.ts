import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { HCAAtlasTrackerEntrySheetValidation } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import entrySheetValidationHandler from "../pages/api/atlases/[atlasId]/entry-sheet-validations/[entrySheetValidationId]";
import {
  ATLAS_NONEXISTENT,
  ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A,
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

const TEST_ROUTE =
  "/api/atlases/[atlasId]/entry-sheet-validations/[entrySheetValidationId]";

const ENTRY_SHEET_VALIDATION_ID_NONEXISTENT =
  "754bef47-19ce-4296-9ed1-d1647cabacb7";

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
        await doEntrySheetValidationRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
        )
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 when entry sheet validation is requested by logged out user", async () => {
    expect(
      (
        await doEntrySheetValidationRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
          undefined,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 when entry sheet validation is requested by unregistered user", async () => {
    expect(
      (
        await doEntrySheetValidationRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
          USER_UNREGISTERED,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 when entry sheet validation is requested by disabled user", async () => {
    expect(
      (
        await doEntrySheetValidationRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 404 when entry sheet validation is requested from nonexistent atlas", async () => {
    expect(
      (
        await doEntrySheetValidationRequest(
          ATLAS_NONEXISTENT.id,
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
          USER_CONTENT_ADMIN,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
  });

  it("returns error 404 when nonexistent entry sheet validation is requested", async () => {
    expect(
      (
        await doEntrySheetValidationRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          ENTRY_SHEET_VALIDATION_ID_NONEXISTENT,
          USER_CONTENT_ADMIN,
          METHOD.GET,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns entry sheet validation",
      TEST_ROUTE,
      entrySheetValidationHandler,
      METHOD.GET,
      role,
      getQueryValues(
        ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
        ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
      ),
      undefined,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(200);
        const validation =
          res._getJSONData() as HCAAtlasTrackerEntrySheetValidation;
        expectEntrySheetValidationToMatchTest(
          validation,
          ENTRY_SHEET_VALIDATION_WITH_UPDATE,
          SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO,
        );
      },
    );
  }

  it("returns entry sheet validation of unpublished source study when requested by content admin", async () => {
    const res = await doEntrySheetValidationRequest(
      ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
      ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const validation =
      res._getJSONData() as HCAAtlasTrackerEntrySheetValidation;
    expectEntrySheetValidationToMatchTest(
      validation,
      ENTRY_SHEET_VALIDATION_WITH_UPDATE,
      SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO,
    );
  });

  it("returns entry sheet validation of published source study when requested by content admin", async () => {
    const res = await doEntrySheetValidationRequest(
      ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
      ENTRY_SHEET_VALIDATION_WITH_FAILED_UPDATE.id,
      USER_CONTENT_ADMIN,
      METHOD.GET,
    );
    expect(res._getStatusCode()).toEqual(200);
    const validation =
      res._getJSONData() as HCAAtlasTrackerEntrySheetValidation;
    expectEntrySheetValidationToMatchTest(
      validation,
      ENTRY_SHEET_VALIDATION_WITH_FAILED_UPDATE,
      SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_BAR,
    );
  });
});

function expectEntrySheetValidationToMatchTest(
  listValidation: HCAAtlasTrackerEntrySheetValidation,
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
  expect(listValidation.validationReport).toEqual(
    testValidation.validation_report,
  );
  expect(listValidation.validationSummary).toEqual(
    testValidation.validation_summary,
  );
  expect(listValidation.publicationString).toEqual(
    getTestSourceStudyCitation(testSourceStudy),
  );
}

async function doEntrySheetValidationRequest(
  atlasId: string,
  entrySheetValidationId: string,
  user: TestUser | undefined,
  method: METHOD,
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query: getQueryValues(atlasId, entrySheetValidationId),
  });
  await withConsoleErrorHiding(
    () => entrySheetValidationHandler(req, res),
    hideConsoleError,
  );
  return res;
}

function getQueryValues(
  atlasId: string,
  entrySheetValidationId: string,
): Record<string, string> {
  return { atlasId, entrySheetValidationId };
}
