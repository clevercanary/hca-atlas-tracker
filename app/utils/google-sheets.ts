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
