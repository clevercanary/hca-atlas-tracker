import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { ValidationError } from "yup";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import { startAtlasEntrySheetValidationsUpdate } from "../app/services/entry-sheets";
import {
  EntrySheetValidationErrorInfo,
  EntrySheetValidationSummary,
} from "../app/utils/hca-validation-tools/hca-validation-tools";
import syncHandler from "../pages/api/atlases/[atlasId]/entry-sheet-validations/sync";
import {
  ATLAS_NONEXISTENT,
  ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A,
  ATLAS_WITH_NON_SHARED_ENTRY_SHEET_VALIDATIONS,
  ENTRY_SHEET_ID_NEW,
  ENTRY_SHEET_ID_NEW_NON_SHARED,
  ENTRY_SHEET_ID_WITH_MALFORMED_RESPONSE,
  ENTRY_SHEET_VALIDATION_NO_SYNC,
  ENTRY_SHEET_VALIDATION_RESPONSE_NEW,
  ENTRY_SHEET_VALIDATION_RESPONSE_WITH_FAILED_UPDATE,
  ENTRY_SHEET_VALIDATION_RESPONSE_WITH_UPDATE,
  ENTRY_SHEET_VALIDATION_WITH_ERRORED_UPDATE,
  ENTRY_SHEET_VALIDATION_WITH_FAILED_UPDATE,
  ENTRY_SHEET_VALIDATION_WITH_UPDATE,
  STAKEHOLDER_ANALOGOUS_ROLES,
  TEST_ENTRY_SHEET_VALIDATION_FETCH_ERROR_MESSAGE,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  deleteEntrySheetValidationBySheetId,
  getEntrySheetValidationBySheetId,
  getEntrySheetValidationFromDatabase,
  resetDatabase,
} from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import {
  expectIsDefined,
  expectIsInstanceOf,
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

const updateMock = startAtlasEntrySheetValidationsUpdate as jest.Mock;

jest.mock("../app/services/entry-sheets", () => {
  const hcaValidationTools = jest.requireActual<
    typeof import("../app/services/entry-sheets")
  >("../app/services/entry-sheets");
  return {
    startAtlasEntrySheetValidationsUpdate: jest.fn(
      hcaValidationTools.startAtlasEntrySheetValidationsUpdate,
    ),
  };
});

const TEST_ROUTE = "/api/atlases/[atlasId]/entry-sheet-validations/sync";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for GET request", async () => {
    expect(
      (
        await doSyncRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          USER_CONTENT_ADMIN,
          METHOD.GET,
        )
      )._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 when requested by logged out user", async () => {
    expect(
      (
        await doSyncRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          undefined,
          METHOD.POST,
          true,
        )
      )._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 when requested by unregistered user", async () => {
    expect(
      (
        await doSyncRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          USER_UNREGISTERED,
          METHOD.POST,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 403 when requested by disabled user", async () => {
    expect(
      (
        await doSyncRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.POST,
          true,
        )
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 404 when requested from nonexistent atlas", async () => {
    expect(
      (
        await doSyncRequest(
          ATLAS_NONEXISTENT.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
    await resolveUpdate().catch(() => undefined);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns status 202 and updates validations",
      TEST_ROUTE,
      syncHandler,
      METHOD.POST,
      role,
      getQueryValues(ATLAS_WITH_NON_SHARED_ENTRY_SHEET_VALIDATIONS.id),
      undefined,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(202);
        await resolveUpdate();
        expect(
          await getEntrySheetValidationBySheetId(ENTRY_SHEET_ID_NEW_NON_SHARED),
        ).toBeDefined();
        await deleteEntrySheetValidationBySheetId(
          ENTRY_SHEET_ID_NEW_NON_SHARED,
        );
        expect(
          await getEntrySheetValidationBySheetId(ENTRY_SHEET_ID_NEW_NON_SHARED),
        ).toBeUndefined();
      },
    );
  }

  it("returns status 202 and updates and creates entry sheet validations as appropriate when requested by content admin", async () => {
    await doMainAtlasTest();
  });
});

async function doMainAtlasTest(): Promise<void> {
  // Get validations before API call

  const validationNoSyncBefore = await getEntrySheetValidationFromDatabase(
    ENTRY_SHEET_VALIDATION_NO_SYNC.id,
  );

  const validationWithUpdateBefore = await getEntrySheetValidationFromDatabase(
    ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
  );
  const validationWithFailedUpdateBefore =
    await getEntrySheetValidationFromDatabase(
      ENTRY_SHEET_VALIDATION_WITH_FAILED_UPDATE.id,
    );
  const validationWithErroredUpdateBefore =
    await getEntrySheetValidationFromDatabase(
      ENTRY_SHEET_VALIDATION_WITH_ERRORED_UPDATE.id,
    );

  // Call API
  const consoleErrorCalls: unknown[][] = [];
  await withConsoleErrorHiding(
    async () => {
      expect(
        (
          await doSyncRequest(
            ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
            USER_CONTENT_ADMIN,
            METHOD.POST,
          )
        )._getStatusCode(),
      ).toEqual(202);

      await resolveUpdate();
    },
    true,
    consoleErrorCalls,
  );

  // Get validations after API call

  const validationWithUpdateAfter = await getEntrySheetValidationFromDatabase(
    ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
  );
  const validationWithFailedUpdateAfter =
    await getEntrySheetValidationFromDatabase(
      ENTRY_SHEET_VALIDATION_WITH_FAILED_UPDATE.id,
    );
  const validationWithErroredUpdateAfter =
    await getEntrySheetValidationFromDatabase(
      ENTRY_SHEET_VALIDATION_WITH_ERRORED_UPDATE.id,
    );

  const validationNewAfter =
    await getEntrySheetValidationBySheetId(ENTRY_SHEET_ID_NEW);
  const validationWithMalformedResponseAfter =
    await getEntrySheetValidationBySheetId(
      ENTRY_SHEET_ID_WITH_MALFORMED_RESPONSE,
    );

  // Check number of Tracker-side errors

  expect(consoleErrorCalls).toHaveLength(2);

  // Check successfully-updated validation

  if (expectIsDefined(validationWithUpdateAfter)) {
    if (expectIsDefined(validationWithUpdateBefore)) {
      expect(validationWithUpdateAfter.last_synced).not.toEqual(
        validationWithUpdateBefore.last_synced,
      );
    }
    expect(validationWithUpdateAfter.validation_report).toEqual(
      ENTRY_SHEET_VALIDATION_RESPONSE_WITH_UPDATE.errors,
    );
    expect(validationWithUpdateAfter.last_updated).toEqual(
      ENTRY_SHEET_VALIDATION_RESPONSE_WITH_UPDATE.last_updated,
    );
    expect(validationWithUpdateAfter.entry_sheet_title).toEqual(
      ENTRY_SHEET_VALIDATION_RESPONSE_WITH_UPDATE.sheet_title,
    );
    expect(validationWithUpdateAfter.validation_summary).toEqual(
      ENTRY_SHEET_VALIDATION_RESPONSE_WITH_UPDATE.summary,
    );
  }

  // Check validation with error on the validation tools end

  if (expectIsDefined(validationWithFailedUpdateAfter)) {
    if (expectIsDefined(validationWithFailedUpdateBefore)) {
      expect(validationWithFailedUpdateAfter.last_synced).not.toEqual(
        validationWithFailedUpdateBefore.last_synced,
      );
    }
    expect(validationWithFailedUpdateAfter.validation_report).toEqual<
      EntrySheetValidationErrorInfo[]
    >([
      {
        cell: null,
        column: null,
        entity_type: null,
        input: null,
        message: ENTRY_SHEET_VALIDATION_RESPONSE_WITH_FAILED_UPDATE.error,
        primary_key: null,
        row: null,
        worksheet_id: null,
      },
    ]);
    expect(validationWithFailedUpdateAfter.last_updated).toBeNull();
    expect(validationWithFailedUpdateAfter.entry_sheet_title).toBeNull();
    expect(
      validationWithFailedUpdateAfter.validation_summary,
    ).toEqual<EntrySheetValidationSummary>({
      dataset_count: null,
      donor_count: null,
      error_count: 1,
      sample_count: null,
    });
  }

  // Check validation with error on the tracker end

  expect(consoleErrorCalls[0]).toHaveLength(1);
  if (expectIsInstanceOf(consoleErrorCalls[0][0], Error)) {
    expect(consoleErrorCalls[0][0].message).toEqual(
      TEST_ENTRY_SHEET_VALIDATION_FETCH_ERROR_MESSAGE,
    );
  }

  if (expectIsDefined(validationWithErroredUpdateAfter)) {
    if (expectIsDefined(validationWithErroredUpdateBefore)) {
      expect(validationWithErroredUpdateAfter.last_synced).not.toEqual(
        validationWithErroredUpdateBefore.last_synced,
      );
    }
    expect(validationWithErroredUpdateAfter.validation_report).toEqual<
      EntrySheetValidationErrorInfo[]
    >([
      {
        cell: null,
        column: null,
        entity_type: null,
        input: null,
        message: `Error: ${TEST_ENTRY_SHEET_VALIDATION_FETCH_ERROR_MESSAGE}`,
        primary_key: null,
        row: null,
        worksheet_id: null,
      },
    ]);
    expect(validationWithErroredUpdateAfter.last_updated).toBeNull();
    expect(validationWithErroredUpdateAfter.entry_sheet_title).toBeNull();
    expect(
      validationWithErroredUpdateAfter.validation_summary,
    ).toEqual<EntrySheetValidationSummary>({
      dataset_count: null,
      donor_count: null,
      error_count: 1,
      sample_count: null,
    });
  }

  // Check new validation

  if (expectIsDefined(validationNewAfter)) {
    expect(validationNewAfter.validation_report).toEqual(
      ENTRY_SHEET_VALIDATION_RESPONSE_NEW.errors,
    );
    expect(validationNewAfter.last_updated).toEqual(
      ENTRY_SHEET_VALIDATION_RESPONSE_NEW.last_updated,
    );
    expect(validationNewAfter.entry_sheet_title).toEqual(
      ENTRY_SHEET_VALIDATION_RESPONSE_NEW.sheet_title,
    );
    expect(validationNewAfter.validation_summary).toEqual(
      ENTRY_SHEET_VALIDATION_RESPONSE_NEW.summary,
    );
  }

  // Check validation with error due to malformed response

  let malformedResponseErrorMessage = "";

  expect(consoleErrorCalls[1]).toHaveLength(1);
  if (expectIsInstanceOf(consoleErrorCalls[1][0], ValidationError)) {
    malformedResponseErrorMessage = consoleErrorCalls[1][0].message;
  }

  if (expectIsDefined(validationWithMalformedResponseAfter)) {
    expect(validationWithMalformedResponseAfter.validation_report).toEqual<
      EntrySheetValidationErrorInfo[]
    >([
      {
        cell: null,
        column: null,
        entity_type: null,
        input: null,
        message: `Received unexpected response format from HCA validation tools: ${malformedResponseErrorMessage}`,
        primary_key: null,
        row: null,
        worksheet_id: null,
      },
    ]);
    expect(validationWithMalformedResponseAfter.last_updated).toBeNull();
    expect(validationWithMalformedResponseAfter.entry_sheet_title).toBeNull();
    expect(
      validationWithMalformedResponseAfter.validation_summary,
    ).toEqual<EntrySheetValidationSummary>({
      dataset_count: null,
      donor_count: null,
      error_count: 1,
      sample_count: null,
    });
  }

  // Check validation not involved in sync

  const validationNoSyncAfter = await getEntrySheetValidationFromDatabase(
    ENTRY_SHEET_VALIDATION_NO_SYNC.id,
  );
  if (
    expectIsDefined(validationNoSyncBefore) &&
    expectIsDefined(validationNoSyncAfter)
  ) {
    expect(validationNoSyncAfter.last_synced).toEqual(
      validationNoSyncBefore.last_synced,
    );
  }
}

async function doSyncRequest(
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
  await withConsoleErrorHiding(() => syncHandler(req, res), hideConsoleError);
  return res;
}

function getQueryValues(atlasId: string): Record<string, string> {
  return { atlasId };
}

async function resolveUpdate(): Promise<void> {
  await (
    await updateMock.mock.results[updateMock.mock.results.length - 1].value
  ).completionPromise;
}
