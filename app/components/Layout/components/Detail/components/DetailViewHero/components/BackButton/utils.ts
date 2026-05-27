import { BackOrigin } from "./constants";

/**
 * Appends a `from=<origin>` query parameter to a URL so the target view can
 * resolve its back-arrow against the originating list. Centralises the query-
 * string format used by all row links into the source-dataset, integrated-
 * object, source-study, and validation detail pages.
 * @param url - Target detail-page URL.
 * @param origin - Back origin (a `ROUTE` key) to record.
 * @returns URL with `?from=<origin>` appended.
 */
export function withBackOrigin(url: string, origin: BackOrigin): string {
  return `${url}?from=${origin}`;
}
