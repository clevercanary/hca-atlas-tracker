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
