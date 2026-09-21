import { type METHOD } from "@/app/common/entities";
import { useScopedRequest } from "@/app/hooks/UseScopedRequest/hook";
import { useCallback, useEffect, useRef } from "react";
import { type UseDeleteData, type UseDeleteDataOptions } from "./types";

/**
 * Returns a delete request function for the given request URL, with failures
 * raised on the app-level error snackbar.
 * @param requestUrl - Request URL.
 * @param method - Request method.
 * @param options - Success callback, the query caches to invalidate on success
 * (see `onRequestSuccess`), and an optional success-status predicate. The
 * default (`isFetchStatusOk`) accepts only 200 and 304, so an endpoint
 * answering 204 needs to say so here. `invalidateQueryKeys` is read when
 * `onDelete` is called rather than captured, so a caller can write it inline
 * without giving `onDelete` — and anything memoized on it — a new identity
 * every render.
 * @returns delete request function, resolving `true` on success.
 */
export const useDeleteData = <T>(
  requestUrl: string,
  method: METHOD,
  options: UseDeleteDataOptions,
): UseDeleteData<T> => {
  const { invalidateQueryKeys, isSuccessStatus, onSuccess } = options;
  const {
    actions: { onRequest },
  } = useScopedRequest();

  // The option is naturally written as inline arrays, a new reference every
  // render, and taking it by reference would remake `onDelete` each time. Held
  // in a ref that is brought up to date after every commit and read only when
  // the request is made, so `onDelete` sees the latest keys without depending
  // on them. Kept as the caller's own object: an earlier hash-and-parse round
  // trip turned an `undefined` key segment into `null`, so an optional path
  // parameter left unset made the key match nothing.
  const invalidateQueryKeysRef = useRef(invalidateQueryKeys);
  useEffect(() => {
    invalidateQueryKeysRef.current = invalidateQueryKeys;
  });

  const onDelete = useCallback(
    (payload?: T): Promise<boolean> =>
      onRequest(requestUrl, method, payload, {
        invalidateQueryKeys: invalidateQueryKeysRef.current,
        isSuccessStatus,
        onSuccess,
      }),
    [isSuccessStatus, method, onRequest, onSuccess, requestUrl],
  );

  return {
    onDelete,
  };
};
