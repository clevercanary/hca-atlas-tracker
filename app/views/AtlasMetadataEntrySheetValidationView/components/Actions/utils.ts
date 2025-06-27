const SPREADSHEET_URL_PREFIX = "https://docs.google.com/spreadsheets/d/";

/**
 * Generates a Google Sheets URL pointing to a specific sheet tab and optionally to a specific cell or row.
 *
 * The generated URL includes the `/edit` path and a fragment with the sheet `gid` and a `range` if a cell or row is specified.
 * - If both `cell` and `row` are provided, `cell` takes precedence.
 * - If neither `cell` nor `row` is provided, the URL will point only to the sheet/tab (or just the sheet if no `gid`).
 *
 * @param entrySheetId - The Google Sheets document ID (from the URL).
 * @param gid - The numeric worksheet (tab) ID. If null, no sheet will be specified.
 * @param cell - A specific cell to link to (e.g. "B7"). Takes precedence over `row` if provided.
 * @param row - A row number to highlight (e.g. 5). Used only if `cell` is null.
 * @returns A complete URL string that opens the Google Sheet at the desired location.
 */
export function buildSheetsUrl(
  entrySheetId: string,
  gid: number | null,
  cell: string | null,
  row: number | null
): string {
  const base = `${SPREADSHEET_URL_PREFIX}${entrySheetId}/edit`;

  const fragments: string[] = [];
  if (gid !== null) fragments.push(`gid=${gid}`);
  if (cell) fragments.push(`range=${cell}`);
  else if (row !== null) fragments.push(`range=${row + 1}:${row + 1}`);

  const fragmentString = fragments.length ? `#${fragments.join("&")}` : "";

  return `${base}${fragmentString}`;
}
