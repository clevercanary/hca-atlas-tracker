import { type METHOD } from "@/app/common/entities";
import { hashKey } from "@tanstack/react-query";

/**
 * Builds the key identifying the operation a request performs. Two requests
 * share a key only when their method, URL and payload all match.
 *
 * Hashed with the query client's own `hashKey`, which sorts object keys, so a
 * payload assembled field-by-field in a different order still matches. Array
 * order is preserved though, and these payloads are arrays of ids taken in
 * table-row order: re-sort the table between a failed bulk request and its
 * retry and the retry is a different operation, so its success leaves the
 * first attempt's entry for the user to dismiss. Acceptable — the failure
 * reported is real and the entry is one click — but it is why this is a key
 * over the request as sent, not over its meaning.
 *
 * Two identical requests in flight at once therefore share an entry: the
 * second's failure replaces the first's, and either one's success dismisses the
 * other's. That is the same mechanism a retry depends on, and the two can't be
 * separated from here — a retry of the call that just failed and an independent
 * identical call are the same three values. Telling them apart needs the caller
 * to declare an identity of its own, a heavier contract than #1564 asked for,
 * and it would cost the retry-replaces-its-own-entry behaviour that issue
 * wanted.
 *
 * Not reachable today. The consumers are `useEditFileArchived`, whose button is
 * disabled while its own request runs and which never has two controls over the
 * same payload mounted at once — the detail and list surfaces are separate
 * routes — and `useDeleteData`, whose one call site keys on a specific source
 * study. Worth revisiting only if a surface ever fires the same operation from
 * two controls concurrently.
 * @param method - Request method.
 * @param requestURL - Request URL.
 * @param payload - Request payload, if any.
 * @returns the operation key.
 */
export function getOperationKey(
  method: METHOD,
  requestURL: string,
  payload: unknown,
): string {
  return hashKey([method, requestURL, payload]);
}
