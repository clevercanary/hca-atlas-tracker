import { formatISOToUTCDateTime } from "../app/utils/date-fns";

describe("formatISOToUTCDateTime", () => {
  it("formats a valid ISO string into date and time parts", () => {
    expect(formatISOToUTCDateTime("2026-04-08T20:47:25.073Z")).toEqual([
      "2026-04-08",
      "20:47:25 (UTC)",
    ]);
  });

  it("drops millisecond precision", () => {
    const result = formatISOToUTCDateTime("2026-01-15T09:03:45.999Z");
    expect(result).toEqual(["2026-01-15", "09:03:45 (UTC)"]);
  });

  it("returns null for null input", () => {
    expect(formatISOToUTCDateTime(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(formatISOToUTCDateTime(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(formatISOToUTCDateTime("")).toBeNull();
  });

  it("returns null for invalid date string", () => {
    expect(formatISOToUTCDateTime("not-a-date")).toBeNull();
  });
});
