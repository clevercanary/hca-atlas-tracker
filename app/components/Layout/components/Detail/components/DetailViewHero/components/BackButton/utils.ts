import { BackOrigin } from "./constants";

// Dummy base for parsing relative URLs through the URL API; never appears
// in the output. We always return `pathname + search + hash`.
// eslint-disable-next-line sonarjs/no-clear-text-protocols -- track via #1371
const DUMMY_BASE = "http://x";

/**
 * Adds a `from=<origin>` query parameter to a URL so the target view can
 * resolve its back-arrow against the originating list. Centralises the query-
 * string format used by all row links into the source-dataset, integrated-
 * object, source-study, and validation detail pages.
 * Preserves any pre-existing query string and hash fragment on the URL.
 * @param url - Target detail-page URL (relative path).
 * @param origin - Back origin (a `ROUTE` key) to record.
 * @returns URL with `from=<origin>` added to the query string.
 */
export function withBackOrigin(url: string, origin: BackOrigin): string {
  const parsed = new URL(url, DUMMY_BASE);
  parsed.searchParams.set("from", origin);
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
