import { type InvalidateQueryKeys, type METHOD } from "@/app/common/entities";
import { useScopedRequest } from "@/app/hooks/UseScopedRequest/hook";
import { hashKey } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { type UseDeleteData, type UseDeleteDataOptions } from "./types";
import { parseInvalidateQueryKeys } from "./utils";

/**
 * Returns a delete request function for the given request URL, with failures
 * raised on the app-level error snackbar.
 * @param requestUrl - Request URL.
 * @param method - Request method.
 * @param options - Success callback, the query caches to invalidate on success
 * (see `onRequestSuccess`), and an optional success-status predicate. The
 * default (`isFetchStatusOk`) accepts only 200 and 304, so an endpoint
 * answering 204 needs to say so here. `invalidateQueryKeys` is compared
 * structurally, so a caller can write it inline without giving `onDelete` — and
 * anything memoized on it — a new identity every render.
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

  // Query keys are plain data, so a hash of them is their identity: the option
  // is naturally written as inline arrays, and taking those by reference would
  // remake `onDelete` on every render. `hashKey` is the query client's own,
  // and the hash is JSON, so the value is parsed back rather than captured —
  // capturing it would need the stale-by-design dependency the lint forbids.
  const invalidateQueryKeysHash = hashKey([invalidateQueryKeys]);
  const stableInvalidateQueryKeys = useMemo(
    (): InvalidateQueryKeys | undefined =>
      parseInvalidateQueryKeys(invalidateQueryKeysHash),
    [invalidateQueryKeysHash],
  );

  const onDelete = useCallback(
    (payload?: T): Promise<boolean> =>
      onRequest(requestUrl, method, payload, {
        invalidateQueryKeys: stableInvalidateQueryKeys,
        isSuccessStatus,
        onSuccess,
      }),
    [
      isSuccessStatus,
      method,
      onRequest,
      onSuccess,
      requestUrl,
      stableInvalidateQueryKeys,
    ],
  );

  return {
    onDelete,
  };
};
