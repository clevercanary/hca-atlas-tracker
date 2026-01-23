import { endPgPool } from "../app/services/database";
import { startEntrySheetValidationsUpdate } from "../app/services/entry-sheets";
import {
  ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A,
  ENTRY_SHEET_ID_NEW,
  ENTRY_SHEET_ID_NO_STUDY,
  SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO,
} from "../testing/constants";
import {
  getSourceStudyEntrySheetValidationsFromDatabase,
  resetDatabase,
} from "../testing/db-utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/utils/hca-validation-tools/hca-validation-tools-api");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("startEntrySheetValidationsUpdate", () => {
  it("only creates validation records for entry sheets that are present on the corresponding source study", async () => {
    const validationSheetIdsBefore = (
      await getSourceStudyEntrySheetValidationsFromDatabase(
        SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO.id,
      )
    ).map((v) => v.entry_sheet_id);

    expect(validationSheetIdsBefore).not.toContain(ENTRY_SHEET_ID_NEW);
    expect(validationSheetIdsBefore).not.toContain(ENTRY_SHEET_ID_NO_STUDY);

    const { completionPromise } = await startEntrySheetValidationsUpdate([
      {
        bioNetwork: ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.network,
        sourceStudyId: SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO.id,
        spreadsheetId: ENTRY_SHEET_ID_NEW,
      },
      {
        bioNetwork: ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A.network,
        sourceStudyId: SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO.id,
        spreadsheetId: ENTRY_SHEET_ID_NO_STUDY,
      },
    ]);
    await completionPromise;

    const validationSheetIdsAfter = (
      await getSourceStudyEntrySheetValidationsFromDatabase(
        SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO.id,
      )
    ).map((v) => v.entry_sheet_id);

    expect(validationSheetIdsAfter).toContain(ENTRY_SHEET_ID_NEW);
    expect(validationSheetIdsAfter).not.toContain(ENTRY_SHEET_ID_NO_STUDY);
  });
});
