import { METHOD } from "@/app/common/entities";
import {
  fetchResource,
  getResponseErrorMessage,
  isFetchStatusOk,
} from "@/app/common/utils";
import { useCallback } from "react";
import { type UseDeleteData, type UseDeleteDataOptions } from "./types";

/**
 * Returns a delete request function for the given request URL. `onDelete`
 * never rejects: any failure — a non-OK response or a network-level fetch
 * error — is routed to `options.onError` and resolves `false`; success calls
 * `options.onSuccess` and resolves `true`.
 * @param requestUrl - Request URL.
 * @param method - Request method (defaults to DELETE).
 * @param options - Error and success callbacks.
 * @returns delete request function, resolving `true` on success.
 */
export const useDeleteData = <T>(
  requestUrl: string,
  method = METHOD.DELETE,
  options: UseDeleteDataOptions,
): UseDeleteData<T> => {
  const { onError, onSuccess } = options;

  const onDelete = useCallback(
    async (payload?: T): Promise<boolean> => {
      let res: Response;
      try {
        res = await fetchResource(requestUrl, method, payload);
      } catch (e) {
        onError(e instanceof Error ? e : new Error(String(e)));
        return false;
      }
      if (!isFetchStatusOk(res.status)) {
        onError(new Error(await getResponseErrorMessage(res)));
        return false;
      }
      // Called outside the try above so an exception thrown by onSuccess
      // (e.g. Router.push) isn't misreported as a failed delete; caught and
      // logged here so it also can't reject onDelete and break the
      // never-rejects contract (the delete itself succeeded).
      try {
        onSuccess?.();
      } catch (e) {
        console.error(e);
      }
      return true;
    },
    [method, onError, onSuccess, requestUrl],
  );

  return {
    onDelete,
  };
};
