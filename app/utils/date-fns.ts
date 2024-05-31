import {
  endOfQuarter,
  format,
  getYear,
  isFuture,
  quartersToMonths,
} from "date-fns";

const FORMAT_STR = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
const FORMAT_STR_YEAR_QUARTER = "yyyy, QQQ";
const QUARTERS = [1, 2, 3, 4];

/**
 * Returns date, formatted as a string.
 * @param date - Date.
 * @param formatStr - Format string.
 * @returns date, formatted as a string.
 */
function formatDate(date: Date, formatStr = FORMAT_STR): string {
  return format(date, formatStr);
}

/**
 * Formats the given date string to the quarter and year e.g. "Q1, 2025".
 * @param dateStr - Date string.
 * @returns quarter year display string.
 */
export function formatDateToQuarterYear(dateStr: string | null): string {
  if (!dateStr) return "Unplanned";
  if (Date.parse(dateStr)) {
    const date = new Date(dateStr);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const dateUTC = new Date(Date.UTC(year, month));
    return format(dateUTC, FORMAT_STR_YEAR_QUARTER);
  }
  return dateStr;
}

/**
 * Returns the current year and the next year.
 * @param date - Date.
 * @returns years.
 */
function getCurrentAndNextYear(date: Date): number[] {
  const year = getYear(date);
  return [year, year + 1];
}

/**
 * Returns the date for the given year and month.
 * @param year - Year.
 * @param month - Month.
 * @returns date.
 */
function getDate(year: number, month: number): Date {
  return new Date(`${year}-${getFormattedMonth(month)}-01T00:00:00Z`);
}

/**
 * Returns the formatted month for a given month number.
 * @param month - The month number (0 for January, 11 for December).
 * @returns The formatted month as a two-digit string.
 */
function getFormattedMonth(month: number): string {
  // Create a new Date object with the given month (month is 0-indexed)
  const date = new Date(0, month - 1);
  // Format the date to get the month as a two-digit string
  return format(date, "MM");
}

/**
 * Returns the future quarter keyed by late (formatted) moment of the quarter for the next two years.
 * @param date - Date.
 * @returns future quarters.
 */
export function getFutureQuarterByDateForNextTwoYears(
  date = new Date()
): Map<string, string> {
  const futureQuarterByDate: Map<string, string> = new Map();
  for (const year of getCurrentAndNextYear(date)) {
    for (const quarter of QUARTERS) {
      const lastMomentOfQuarter = getLastMomentOfQuarter(quarter, year);
      if (isFuture(lastMomentOfQuarter)) {
        futureQuarterByDate.set(
          formatDate(lastMomentOfQuarter),
          formatDate(lastMomentOfQuarter, FORMAT_STR_YEAR_QUARTER)
        );
      }
    }
  }
  return futureQuarterByDate;
}

/**
 * Returns the last moment of the given quarter.
 * @param quarter - Quarter.
 * @param year - Year.
 * @returns last moment of the quarter.
 */
function getLastMomentOfQuarter(quarter: number, year: number): Date {
  const month = quartersToMonths(quarter);
  const date = getDate(year, month);
  return endOfQuarter(date);
}
