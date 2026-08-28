import { METHOD } from "@/app/common/entities";
import { performRequest } from "@/app/common/requests";
import { useCallback } from "react";
import { type UseDeleteData, type UseDeleteDataOptions } from "./types";

/**
 * Returns a delete request function for the given request URL. `onDelete`
 * never rejects (see `performRequest`): any failure — a non-OK response or a
 * network-level fetch error — is routed to `options.onError` and resolves
 * `false`; success calls `options.onSuccess` and resolves `true`.
 * @param requestUrl - Request URL.
 * @param method - Request method (defaults to DELETE).
 * @param options - Error and success callbacks, and an optional success-status
 * predicate. The default (`isFetchStatusOk`) accepts only 200 and 304, so an
 * endpoint answering 204 — the conventional success for DELETE — needs to say
 * so here; forwarded rather than dropped so the option this hook's type
 * advertises is the option it honours.
 * @returns delete request function, resolving `true` on success.
 */
export const useDeleteData = <T>(
  requestUrl: string,
  method = METHOD.DELETE,
  options: UseDeleteDataOptions,
): UseDeleteData<T> => {
  const { isSuccessStatus, onError, onSuccess } = options;

  const onDelete = useCallback(
    (payload?: T): Promise<boolean> =>
      performRequest(requestUrl, method, payload, {
        isSuccessStatus,
        onError,
        onSuccess,
      }),
    [isSuccessStatus, method, onError, onSuccess, requestUrl],
  );

  return {
    onDelete,
  };
};
