import { GaxiosError, GaxiosResponse } from "gaxios";
import { sheets_v4 } from "googleapis";
import {
  TEST_GOOGLE_SHEET_TITLES_BY_ID,
  TEST_UNSHARED_GOOGLE_SHEET_IDS,
} from "../testing/constants";

type TestGaxiosPromise<T> = Promise<Pick<GaxiosResponse<T>, "data">>;

function GoogleAuth(): unknown {
  return "TEST_GOOGLE_AUTH";
}

export const google = {
  auth: {
    GoogleAuth,
  },

  sheets(): unknown {
    return {
      spreadsheets: {
        async get({
          spreadsheetId,
        }: {
          spreadsheetId: string;
        }): TestGaxiosPromise<sheets_v4.Schema$Spreadsheet> {
          if (TEST_UNSHARED_GOOGLE_SHEET_IDS.has(spreadsheetId))
            throw makeTestGaxiosError(403);
          if (!(spreadsheetId in TEST_GOOGLE_SHEET_TITLES_BY_ID))
            throw makeTestGaxiosError(404);
          return {
            data: {
              properties: {
                title: TEST_GOOGLE_SHEET_TITLES_BY_ID[spreadsheetId],
              },
            },
          };
        },
      },
    };
  },
};

function makeTestGaxiosError(status: number): GaxiosError {
  return new GaxiosError("", {}, { status } as GaxiosResponse);
}
