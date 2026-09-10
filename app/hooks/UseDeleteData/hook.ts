import { type METHOD } from "@/app/common/entities";
import { useScopedRequest } from "@/app/hooks/UseScopedRequest/hook";
import { useCallback } from "react";
import { type UseDeleteData, type UseDeleteDataOptions } from "./types";

/**
 * Returns a delete request function for the given request URL, with failures
 * raised on the app-level error snackbar.
 * @param requestUrl - Request URL.
 * @param method - Request method.
 * @param options - Success callback, and an optional success-status predicate.
 * The default (`isFetchStatusOk`) accepts only 200 and 304, so an endpoint
 * answering 204 needs to say so here.
 * @returns delete request function, resolving `true` on success.
 */
export const useDeleteData = <T>(
  requestUrl: string,
  method: METHOD,
  options: UseDeleteDataOptions,
): UseDeleteData<T> => {
  const { isSuccessStatus, onSuccess } = options;
  const {
    actions: { onRequest },
  } = useScopedRequest();

  const onDelete = useCallback(
    (payload?: T): Promise<boolean> =>
      onRequest(requestUrl, method, payload, { isSuccessStatus, onSuccess }),
    [isSuccessStatus, method, onRequest, onSuccess, requestUrl],
  );

  return {
    onDelete,
  };
};
