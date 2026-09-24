import { type METHOD } from "@/app/common/entities";
import { useIsomorphicLayoutEffect } from "@/app/hooks/useIsomorphicLayoutEffect";
import { useScopedRequest } from "@/app/hooks/UseScopedRequest/hook";
import { useCallback, useRef } from "react";
import { type UseDeleteData, type UseDeleteDataOptions } from "./types";

/**
 * Returns a delete request function for the given request URL, with failures
 * raised on the app-level error snackbar.
 * @param requestUrl - Request URL.
 * @param method - Request method.
 * @param options - Success callback, the query caches to invalidate on success
 * (see `invalidateQueryCaches`), and an optional success-status predicate. The
 * default (`isFetchStatusOk`) accepts only 200 and 304, so an endpoint
 * answering 204 needs to say so here. The options are read when `onDelete` is
 * called rather than captured, so a caller can write them inline without
 * giving `onDelete` — and anything memoized on it — a new identity every
 * render.
 * @returns delete request function, resolving `true` on success.
 */
export const useDeleteData = <T>(
  requestUrl: string,
  method: METHOD,
  options: UseDeleteDataOptions,
): UseDeleteData<T> => {
  const {
    actions: { onRequest },
  } = useScopedRequest();

  // The options are naturally written inline — `invalidateQueryKeys` as nested
  // arrays, `onSuccess` as an arrow — so each is a new reference every render,
  // and depending on either would remake `onDelete` each time. The whole
  // object is held in a ref, brought up to date in a layout effect and read
  // only when the request is made. The layout effect means an `onDelete` fired
  // from an event handler or a passive effect in the same commit sees the new
  // options; a descendant's layout effect runs before this one and would still
  // read the previous ones. Kept as the caller's own object: an earlier
  // hash-and-parse round trip turned an `undefined` key segment into `null`, so
  // an optional path parameter left unset made the key match nothing.
  const optionsRef = useRef(options);
  useIsomorphicLayoutEffect(() => {
    optionsRef.current = options;
  });

  const onDelete = useCallback(
    (payload?: T): Promise<boolean> =>
      onRequest(requestUrl, method, payload, optionsRef.current),
    [method, onRequest, requestUrl],
  );

  return {
    onDelete,
  };
};
