import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import { updateAtlasEntrySheetValidations } from "../app/services/entry-sheets";
import syncHandler from "../pages/api/atlases/[atlasId]/entry-sheets/sync";
import {
  ATLAS_DRAFT,
  ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A,
  ENTRY_SHEET_VALIDATION_RESPONSE_WITH_UPDATE,
  ENTRY_SHEET_VALIDATION_WITH_UPDATE,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import {
  getEntrySheetValidationFromDatabase,
  resetDatabase,
} from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import { expectIsDefined, withConsoleErrorHiding } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/utils/hca-validation-tools");

jest.mock("next-auth");

const updateMock = updateAtlasEntrySheetValidations as jest.Mock;

jest.mock("../app/services/entry-sheets", () => {
  const hcaValidationTools = jest.requireActual<
    typeof import("../app/services/entry-sheets")
  >("../app/services/entry-sheets");
  return {
    updateAtlasEntrySheetValidations: jest.fn(
      hcaValidationTools.updateAtlasEntrySheetValidations
    ),
  };
});

const TEST_ROUTE = "/api/atlases/[atlasId]/entry-sheets/sync";

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
        await doSyncRequest(ATLAS_DRAFT.id, USER_CONTENT_ADMIN, METHOD.GET)
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 when source datasets are requested by logged out user", async () => {
    expect(
      (
        await doSyncRequest(ATLAS_DRAFT.id, undefined, METHOD.POST, true)
      )._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 when source datasets are requested by unregistered user", async () => {
    expect(
      (
        await doSyncRequest(
          ATLAS_DRAFT.id,
          USER_UNREGISTERED,
          METHOD.POST,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 when source datasets are requested by disabled user", async () => {
    expect(
      (
        await doSyncRequest(
          ATLAS_DRAFT.id,
          USER_DISABLED_CONTENT_ADMIN,
          METHOD.POST,
          true
        )
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns status 202 and updates and creates entry sheet validations as appropriate", async () => {
    expect(
      (
        await doSyncRequest(
          ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.id,
          USER_CONTENT_ADMIN,
          METHOD.POST
        )
      )._getStatusCode()
    ).toEqual(202);

    await updateMock.mock.results[updateMock.mock.results.length - 1].value;

    const validationWithUpdateAfter = await getEntrySheetValidationFromDatabase(
      ENTRY_SHEET_VALIDATION_WITH_UPDATE.id
    );
    if (expectIsDefined(validationWithUpdateAfter)) {
      expect(validationWithUpdateAfter.validation_report).toEqual(
        ENTRY_SHEET_VALIDATION_RESPONSE_WITH_UPDATE.errors
      );
      expect(validationWithUpdateAfter.last_updated).toEqual(
        ENTRY_SHEET_VALIDATION_RESPONSE_WITH_UPDATE.last_updated
      );
      expect(validationWithUpdateAfter.entry_sheet_title).toEqual(
        ENTRY_SHEET_VALIDATION_RESPONSE_WITH_UPDATE.sheet_title
      );
      expect(validationWithUpdateAfter.validation_summary).toEqual(
        ENTRY_SHEET_VALIDATION_RESPONSE_WITH_UPDATE.summary
      );
    }
  });
});

async function doSyncRequest(
  atlasId: string,
  user: TestUser | undefined,
  method: METHOD,
  hideConsoleError = false
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
