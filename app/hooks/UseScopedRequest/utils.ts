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
 * So a caller that can fire the same operation twice has to serialize it
 * itself, and one did: the source study delete menu closes on click but can be
 * reopened while the request is away, sending an identical DELETE. First
 * failing and second succeeding erased the unread failure. `useDeleteSourceStudy`
 * now guards re-entry, and `delete-source-study` pins it.
 *
 * The remaining consumer is safe by construction rather than by guard:
 * `useEditFileArchived`'s button is disabled while its own request runs, and no
 * two controls over the same payload are mounted at once — the detail and list
 * surfaces are separate routes. That is a property of the surfaces, not of this
 * key, so a new caller needs checking rather than assuming.
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
