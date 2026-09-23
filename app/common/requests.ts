import { type QueryClient } from "@tanstack/react-query";
import {
  type InvalidateQueryKeys,
  type METHOD,
  type PerformRequestOptions,
  type RequestOptions,
} from "./entities";
import {
  fetchResource,
  getResponseErrorMessage,
  isFetchStatusOk,
} from "./utils";

/**
 * Invalidates the declared query caches, resolving once the `awaited` ones have
 * refetched.
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
async function invalidateQueryCaches(
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
 * Success handling shared by the request hooks: dispatches the caller's
 * declared invalidations, runs its `onSuccess`, and resolves once both the
 * callback and the awaited invalidations have settled.
 *
 * The invalidations are performed here rather than left to `onSuccess` so the
 * pending window a call site declares can't be lost to a forgotten `return`
 * (#1553): `onSuccess?: () => void | Promise<unknown>` type-checks either way,
 * and without the `return` the control re-enabled before the refetched state
 * landed.
 *
 * They are dispatched *before* the callback runs, so the two are independent in
 * timing as well as in outcome: a slow or async `onSuccess` (one that parses
 * the body first, say) can't hold the declared refetches back, and a throwing
 * one can't skip them — a stale list left behind by a thrown side effect would
 * survive until a manual refresh. Both are awaited with `allSettled` so a
 * rejecting callback still waits for the invalidations; its error is logged
 * here since `allSettled` would otherwise swallow it.
 *
 * `onSuccess` keeps `performRequest`'s awaited contract, for the consumers that
 * still sequence their own work in it (e.g. a redirect after a cache removal).
 * @param queryClient - Query client.
 * @param res - Successful response.
 * @param options - Request options carrying the callback and the query keys.
 * @returns promise resolving once the awaited invalidations have settled.
 */
export async function onRequestSuccess(
  queryClient: QueryClient,
  res: Response,
  options: RequestOptions = {},
): Promise<void> {
  const { invalidateQueryKeys, onSuccess } = options;
  // Every key is dispatched synchronously inside this call, before the first
  // await below, so the callback can neither delay nor skip them.
  const invalidated = invalidateQueryCaches(queryClient, invalidateQueryKeys);
  // The async wrapper calls the callback synchronously but turns a throw into
  // a rejection, so `allSettled` sees it rather than this function throwing.
  const [callback] = await Promise.allSettled([
    (async (): Promise<unknown> => onSuccess?.(res))(),
    invalidated,
  ]);
  if (callback.status === "rejected") console.error(callback.reason);
}

/**
 * Performs a mutation request with a never-rejects contract: any failure — a
 * non-success response or a network-level fetch error — is routed to
 * `options.onError` and resolves `false`; success calls (and awaits, so
 * callers can defer to e.g. a query-cache refetch) `options.onSuccess` with
 * the response, then resolves `true`. Both callbacks are guarded, so a
 * throwing or rejecting callback is logged rather than allowed to reject the
 * returned promise.
 * @param requestURL - Request URL.
 * @param method - Request method.
 * @param payload - Request payload, JSON-serialized when defined.
 * @param options - Error and success callbacks, and an optional success-status
 * predicate for endpoints that don't answer 200 (defaults to `isFetchStatusOk`).
 * @returns promise resolving `true` on success.
 */
export async function performRequest<P>(
  requestURL: string,
  method: METHOD,
  payload: P | undefined,
  options: PerformRequestOptions,
): Promise<boolean> {
  const { isSuccessStatus = isFetchStatusOk, onError, onSuccess } = options;
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
  // Called after the request is known to have succeeded so an exception
  // thrown by onSuccess (e.g. Router.push, or parsing the response body)
  // isn't misreported as a failed request; caught and logged here so it also
  // can't reject and break the never-rejects contract.
  try {
    await onSuccess?.(res);
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
function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}
