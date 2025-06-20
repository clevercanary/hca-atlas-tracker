import { google } from "googleapis";
import { GaxiosError } from "googleapis-common";
import { ValidationError } from "yup";

export class InvalidSheetError extends Error {
  name = "InvalidSheetError";
}

export function getSpreadsheetIdFromUrl(urlString: string): string {
  const spreadsheetId = urlString.match(/\/spreadsheets\/d\/([^/?#]+)/)?.[1];

  if (!spreadsheetId) {
    throw new InvalidSheetError(
      "Invalid Google Sheets URL. Expected format: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/..."
    );
  }

  return spreadsheetId;
}

export async function getSheetTitle(
  spreadsheetUrl: string
): Promise<string | null> {
  // Get credentials from environment variable
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!credentialsJson) {
    console.error("GOOGLE_SERVICE_ACCOUNT environment variable not found");
    return null;
  }
  // Parse JSON credentials
  const credentials = JSON.parse(credentialsJson);

  // Create a JWT client
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  // Create Sheets API client
  const sheets = google.sheets({ auth, version: "v4" });

  const spreadsheetId = getSpreadsheetIdFromUrl(spreadsheetUrl);

  try {
    // Get spreadsheet metadata
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });
    return response.data.properties?.title ?? "Untitled";
  } catch (error) {
    if (error instanceof GaxiosError) {
      if (error.response?.status === 404) {
        throw new InvalidSheetError(
          `The sheet with ID ${JSON.stringify(
            spreadsheetId
          )} does not exist. Please check if the URL is correct.`
        );
      } else if (error.response?.status === 403) {
        throw new InvalidSheetError(
          `To enable the tracker to read the spreadsheet, please share it with ${process.env.SERVICE_ACCOUNT_EMAIL}`
        );
      }
    }
    throw error;
  }
}

/**
 * Get title of given spreadsheet if specified, throwing a validation error if the title isn't accessible.
 * @param spreadsheetUrl - URL of spreadsheet to get title of.
 * @param schemaKey - Key of the field containing the spreadsheet URL, to be used in a validation error.
 * @returns spreadsheet title or null.
 */
export async function getSheetTitleForApi(
  spreadsheetUrl: string | null | undefined,
  schemaKey: string
): Promise<string | null> {
  return spreadsheetUrl
    ? await getSheetTitle(spreadsheetUrl).catch((err) => {
        throw err instanceof InvalidSheetError
          ? new ValidationError(err.message, undefined, schemaKey)
          : err;
      })
    : null;
}
