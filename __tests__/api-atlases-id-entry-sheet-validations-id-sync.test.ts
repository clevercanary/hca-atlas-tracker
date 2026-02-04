import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import { startUpdateForEntrySheetValidation } from "../app/services/entry-sheets";
import syncHandler from "../pages/api/atlases/[atlasId]/entry-sheet-validations/[entrySheetValidationId]/sync";
import {
  ATLAS_NONEXISTENT,
  ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A,
  ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_B,
  ENTRY_SHEET_VALIDATION_RESPONSE_WITH_UPDATE,
  ENTRY_SHEET_VALIDATION_WITH_FAILED_UPDATE,
  ENTRY_SHEET_VALIDATION_WITH_UPDATE,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  deleteEntrySheetValidationFromDatabase,
  getEntrySheetValidationFromDatabase,
  initEntrySheetValidation,
  resetDatabase,
} from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import {
  expectIsDefined,
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

const updateMock = startUpdateForEntrySheetValidation as jest.Mock;

jest.mock("../app/services/entry-sheets", () => {
  const hcaValidationTools = jest.requireActual<
    typeof import("../app/services/entry-sheets")
  >("../app/services/entry-sheets");
  return {
    startUpdateForEntrySheetValidation: jest.fn(
      hcaValidationTools.startUpdateForEntrySheetValidation,
    ),
  };
});

const ENTRY_SHEET_VALIDATION_ID_NONEXISTENT =
  "66b69811-927a-4a40-9a94-b3c7e02de32c";

const TEST_ROUTE =
  "/api/atlases/[atlasId]/entry-sheet-validations/[entrySheetValidationId]/sync";

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
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
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
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
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
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
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
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
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
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
    await resolveUpdate().catch(() => undefined);
  });

  it("returns error 404 when requested for nonexistent entry sheet validation", async () => {
    expect(
      (
        await doSyncRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          ENTRY_SHEET_VALIDATION_ID_NONEXISTENT,
          USER_CONTENT_ADMIN,
          METHOD.POST,
          true,
        )
      )._getStatusCode(),
    ).toEqual(404);
    await resolveUpdate().catch(() => undefined);
  });

  it("returns error 404 when requested from wrong atlas", async () => {
    expect(
      (
        await doSyncRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_B.id,
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
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
      "returns status 202 and updates validation",
      TEST_ROUTE,
      syncHandler,
      METHOD.POST,
      role,
      getQueryValues(
        ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
        ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
      ),
      undefined,
      false,
      async (res) => {
        expect(res._getStatusCode()).toEqual(202);
        await resolveUpdate();
        const updatedValidation = await getEntrySheetValidationFromDatabase(
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
        );
        expect(updatedValidation?.entry_sheet_title).toEqual(
          ENTRY_SHEET_VALIDATION_RESPONSE_WITH_UPDATE.sheet_title,
        );
        await deleteEntrySheetValidationFromDatabase(
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
        );
        await initEntrySheetValidation(ENTRY_SHEET_VALIDATION_WITH_UPDATE);
        const restoredValidation = await getEntrySheetValidationFromDatabase(
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
        );
        expect(restoredValidation?.entry_sheet_title).toEqual(
          ENTRY_SHEET_VALIDATION_WITH_UPDATE.entry_sheet_title,
        );
      },
    );
  }

  it("returns status 202 and updates entry sheet validation when requested by content admin", async () => {
    await doMainAtlasTest();
  });
});

async function doMainAtlasTest(): Promise<void> {
  // Get validations before API call

  const validationWithFailedUpdateBefore =
    await getEntrySheetValidationFromDatabase(
      ENTRY_SHEET_VALIDATION_WITH_FAILED_UPDATE.id,
    );

  const validationWithUpdateBefore = await getEntrySheetValidationFromDatabase(
    ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
  );

  // Call API
  expect(
    (
      await doSyncRequest(
        ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
        ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
        USER_CONTENT_ADMIN,
        METHOD.POST,
      )
    )._getStatusCode(),
  ).toEqual(202);

  await resolveUpdate();

  // Get validation after API call

  const validationWithUpdateAfter = await getEntrySheetValidationFromDatabase(
    ENTRY_SHEET_VALIDATION_WITH_UPDATE.id,
  );

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

  // Check validation not involved in sync

  const validationWithFailedUpdateAfter =
    await getEntrySheetValidationFromDatabase(
      ENTRY_SHEET_VALIDATION_WITH_FAILED_UPDATE.id,
    );
  if (
    expectIsDefined(validationWithFailedUpdateBefore) &&
    expectIsDefined(validationWithFailedUpdateAfter)
  ) {
    expect(validationWithFailedUpdateAfter.last_synced).toEqual(
      validationWithFailedUpdateBefore.last_synced,
    );
  }
}

async function doSyncRequest(
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
  await withConsoleErrorHiding(() => syncHandler(req, res), hideConsoleError);
  return res;
}

function getQueryValues(
  atlasId: string,
  entrySheetValidationId: string,
): Record<string, string> {
  return { atlasId, entrySheetValidationId };
}

async function resolveUpdate(): Promise<void> {
  await (
    await updateMock.mock.results[updateMock.mock.results.length - 1].value
  ).completionPromise;
}
