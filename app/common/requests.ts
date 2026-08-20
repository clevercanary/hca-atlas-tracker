import { type METHOD, type PerformRequestOptions } from "./entities";
import {
  fetchResource,
  getResponseErrorMessage,
  isFetchStatusOk,
} from "./utils";

/**
 * Performs a mutation request with a never-rejects contract: any failure — a
 * non-OK response or a network-level fetch error — is routed to
 * `options.onError` and resolves `false`; success calls (and awaits, so
 * callers can defer to e.g. a query-cache refetch) `options.onSuccess`, then
 * resolves `true`. Both callbacks are guarded, so a throwing or rejecting
 * callback is logged rather than allowed to reject the returned promise.
 * @param requestURL - Request URL.
 * @param method - Request method.
 * @param payload - Request payload, JSON-serialized when defined.
 * @param options - Error and success callbacks.
 * @returns promise resolving `true` on success.
 */
export async function performRequest<P>(
  requestURL: string,
  method: METHOD,
  payload: P | undefined,
  options: PerformRequestOptions,
): Promise<boolean> {
  const { onError, onSuccess } = options;
  let res: Response;
  try {
    res = await fetchResource(requestURL, method, payload);
  } catch (e) {
    reportError(onError, toError(e));
    return false;
  }
  if (!isFetchStatusOk(res.status)) {
    reportError(onError, new Error(await getResponseErrorMessage(res)));
    return false;
  }
  // Called after the request is known to have succeeded so an exception
  // thrown by onSuccess (e.g. Router.push) isn't misreported as a failed
  // request; caught and logged here so it also can't reject and break the
  // never-rejects contract.
  try {
    await onSuccess?.();
  } catch (e) {
    console.error(e);
  }
  return true;
}

/**
 * Routes an error to the given handler, guarded so a throwing handler is
 * logged rather than allowed to break `performRequest`'s never-rejects
 * contract.
 * @param onError - Error callback.
 * @param error - Error to report.
 */
function reportError(onError: (error: Error) => void, error: Error): void {
  try {
    onError(error);
  } catch (e) {
    console.error(e);
  }
}

/**
 * Normalizes an unknown thrown value to an Error.
 * @param e - Thrown value.
 * @returns the value itself when it's an Error, otherwise an Error wrapping
 * its string form.
 */
export function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}
