import { type QueryClient } from "@tanstack/react-query";
import {
  type InvalidateQueryKeys,
  type METHOD,
  type PerformRequestOptions,
} from "./entities";
import {
  fetchResource,
  getResponseErrorMessage,
  isFetchStatusOk,
} from "./utils";

/**
 * Reads the success body, when the caller parses one, and hands it to
 * `onSuccess`.
 *
 * `onSuccess` is called only after the body has been read, so an exception it
 * throws (e.g. Router.push) isn't misreported as a failed request; it's logged
 * rather than allowed to reject and break `performRequest`'s never-rejects
 * contract.
 * @param res - Successful response.
 * @param options - Request options carrying the body parser and the callback.
 * @returns promise resolving `false` when the body couldn't be parsed.
 */
async function completeRequest<T>(
  res: Response,
  options: PerformRequestOptions<T>,
): Promise<boolean> {
  if (!options.parseBody) {
    await runGuarded(options.onSuccess);
    return true;
  }
  const { onError, onSuccess, parseBody } = options;
  let body: T;
  try {
    body = await parseBody(res);
  } catch (e) {
    reportError(onError, toError(e));
    return false;
  }
  await runGuarded(() => onSuccess?.(body));
  return true;
}

/**
 * Invalidates the declared query caches, resolving once the `awaited` ones have
 * refetched. The request hooks run it as `performRequest`'s `onCommitted`, so
 * it runs as soon as the server accepts the request: before the body is parsed
 * and before `onSuccess`.
 *
 * The invalidations are performed by the request layer rather than left to
 * `onSuccess` so the pending window a call site declares can't be lost to a
 * forgotten `return` (#1553): `onSuccess?: () => void | Promise<unknown>`
 * type-checks either way, and without the `return` the control re-enabled
 * before the refetched state landed. Running them on commit also keeps them
 * independent of everything after it: a slow body or `onSuccess` can't hold the
 * refetches back, and neither an unreadable body nor a throwing side effect can
 * skip them — the mutation has taken effect either way, and a stale list left
 * behind would survive until a manual refresh.
 *
 * Every key is dispatched in one synchronous pass before anything is awaited,
 * so a caller whose control unmounts on success (the bulk archive toolbar
 * resets its row selection) still gets its invalidations in flight, and the
 * `dispatched` keys never queue behind an `awaited` refetch.
 *
 * The `dispatched` keys go first, so within this call none of them can cancel
 * an awaited refetch: none has started yet. Both lists keep TanStack's default
 * `cancelRefetch: true`, which cancels a fetch already in flight (a focus or
 * mount refetch sent before the mutation landed) and starts a fresh one.
 * Reusing that fetch instead would let it settle with pre-mutation data and
 * clear the invalidated flag, leaving the cache stale. Where a dispatched key
 * overlaps an awaited one, the awaited invalidation replaces the dispatched
 * refetch with its own: one wasted request, but the awaited window still waits
 * for post-mutation data. No current caller overlaps.
 *
 * Two cases still rest on TanStack internals rather than on this function:
 * - Across calls, a later request's key can cancel an earlier request's awaited
 *   refetch. The earlier window still holds, and waits for the newer data,
 *   because TanStack hands a silently cancelled fetch's promise on to its
 *   replacement.
 * - A query with no data yet is not cancelled: `cancelRefetch` only applies
 *   once a query has data, so an initial load sent before the mutation landed
 *   is reused and can settle with pre-mutation data. That needs the query to
 *   be loading for the first time as the mutation succeeds, which is unlikely
 *   for current callers: each mutates an entity its view has already loaded.
 *
 * Nothing is caught: `invalidateQueries` catches each query's rejection itself
 * unless `throwOnError` is set, which it isn't here, so these promises resolve
 * either way.
 * @param queryClient - Query client.
 * @param invalidateQueryKeys - Query keys to invalidate, awaited and dispatched.
 * @returns promise resolving once the awaited invalidations have settled.
 */
export async function invalidateQueryCaches(
  queryClient: QueryClient,
  invalidateQueryKeys: InvalidateQueryKeys = {},
): Promise<void> {
  const { awaited = [], dispatched = [] } = invalidateQueryKeys;
  for (const queryKey of dispatched) {
    queryClient.invalidateQueries({ queryKey });
  }
  await Promise.all(
    awaited.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}

/**
 * Performs a mutation request with a never-rejects contract: any failure — a
 * non-success response, a network-level fetch error, or a success response
 * whose body `options.parseBody` can't parse — is routed to `options.onError`
 * and resolves `false`; success calls (and awaits, so callers can defer to
 * e.g. a query-cache refetch) `options.onSuccess` with the parsed body, if the
 * caller parses one, then resolves `true`. The callbacks are guarded, so a
 * throwing or rejecting callback is logged rather than allowed to reject the
 * returned promise.
 *
 * A success status means the server has accepted the request, so
 * `options.onCommitted` runs then, before the body is parsed: an unreadable
 * body is still a committed mutation, and whatever it needs (the hooks' cache
 * invalidations) must not be skipped because the caller can't learn its result.
 * It runs alongside the rest and is awaited on either outcome.
 *
 * Parsing the body is a separate step from `onSuccess` because the two fail
 * differently (#1550): an unreadable body means the caller never learns what
 * the request produced, so it's a failure to report, whereas a throwing side
 * effect (e.g. a navigation) happens after the request has already succeeded
 * and must not be misreported as a failed one.
 * @param requestURL - Request URL.
 * @param method - Request method.
 * @param payload - Request payload, JSON-serialized when defined.
 * @param options - Error, commit and success callbacks, an optional body
 * parser, and an optional success-status predicate for endpoints that don't
 * answer 200 (defaults to `isFetchStatusOk`).
 * @returns promise resolving `true` on success.
 */
export async function performRequest<P, T = void>(
  requestURL: string,
  method: METHOD,
  payload: P | undefined,
  options: PerformRequestOptions<T>,
): Promise<boolean> {
  const { isSuccessStatus = isFetchStatusOk, onCommitted, onError } = options;
  let res: Response;
  try {
    res = await fetchResource(requestURL, method, payload);
  } catch (e) {
    reportError(onError, toError(e));
    return false;
  }
  if (!isSuccessStatus(res.status)) {
    reportError(onError, new Error(await getResponseErrorMessage(res)));
    return false;
  }
  // Started before the body is read, and called synchronously, so a hook's
  // invalidations are all dispatched before anything below is awaited.
  const committed = runGuarded(onCommitted);
  const succeeded = await completeRequest(res, options);
  await committed;
  return succeeded;
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
 * Runs a side-effect callback, logging rather than propagating anything it
 * throws or rejects with. It's called synchronously, so whatever the callback
 * does before its first `await` has happened by the time this returns.
 * @param callback - Callback to run, if any.
 * @returns promise resolving once the callback has settled.
 */
async function runGuarded(
  callback: (() => void | Promise<unknown>) | undefined,
): Promise<void> {
  try {
    await callback?.();
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
function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}
