import { type RequestFn } from "@/app/common/entities";
import { useCallback, useState } from "react";
import { type UsePendingRequest } from "./types";

/**
 * Wraps a request function with an in-flight flag, for the consumers that
 * disable a control while the request runs.
 *
 * Separate from the request wrappers themselves so a consumer that doesn't
 * read the flag doesn't pay for it: one hook instance can be shared by many
 * controls (a table's rows all reach `useDeleteData` through one provider),
 * where a flag nobody reads is both misleading and a re-render of the whole
 * subtree per request.
 *
 * `isRequesting` is reset on every outcome, so a control disabled on it cannot
 * stick. In a `finally`, because the wrapped function is any `RequestFn`: the
 * ones here bottom out in `performRequest`, which never rejects, but a wrapper
 * that did would otherwise leave the control disabled for good.
 * @param onRequest - Request function to wrap.
 * @returns the wrapped request function and its in-flight flag.
 */
export const usePendingRequest = (onRequest: RequestFn): UsePendingRequest => {
  const [isRequesting, setIsRequesting] = useState(false);

  const onPendingRequest = useCallback<RequestFn>(
    async (requestURL, method, payload, options) => {
      setIsRequesting(true);
      try {
        return await onRequest(requestURL, method, payload, options);
      } finally {
        setIsRequesting(false);
      }
    },
    [onRequest],
  );

  return { isRequesting, onRequest: onPendingRequest };
};
