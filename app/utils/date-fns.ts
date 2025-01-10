import { endOfQuarter, format, getYear, quartersToMonths } from "date-fns";

const FORMAT_STR = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
const FORMAT_STR_YEAR_QUARTER = "yyyy, QQQ";
const QUARTERS = [1, 2, 3, 4];
export const GREATEST_UNIX_TIME = "2038-01-19T13:14:07.000Z";
const BEGINNING_PAST_YEAR = 2023;
const BEGINNING_PAST_YEAR_QUARTERS = [4];

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
  if (!dateStr || dateStr === GREATEST_UNIX_TIME) return "Unplanned";
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
 * Returns the quarters keyed by last (formatted) moment of the quarter from Q4 2023 to the end of next year.
 * @param date - Date.
 * @returns quarters.
 */
export function getPastAndNextTwoYearsQuartersByDate(
  date = new Date()
): Map<string, string> {
  const quartersByDate: Map<string, string> = new Map();
  const finalListedYear = getYear(date) + 1;
  for (let year = BEGINNING_PAST_YEAR; year <= finalListedYear; year++) {
    for (const quarter of year === BEGINNING_PAST_YEAR
      ? BEGINNING_PAST_YEAR_QUARTERS
      : QUARTERS) {
      const lastMomentOfQuarter = getLastMomentOfQuarter(quarter, year);
      quartersByDate.set(
        formatDate(lastMomentOfQuarter),
        formatDate(lastMomentOfQuarter, FORMAT_STR_YEAR_QUARTER)
      );
    }
  }
  return quartersByDate;
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
