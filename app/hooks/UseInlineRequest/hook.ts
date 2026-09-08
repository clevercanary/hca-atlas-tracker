import { type RequestFn } from "@/app/common/entities";
import { performRequest } from "@/app/common/requests";
import { usePendingRequest } from "@/app/hooks/UsePendingRequest/hook";
import { useCallback, useState } from "react";
import { type UseInlineRequest } from "./types";

/**
 * Performs a request, returning any failure as `error` for the caller to
 * render. The error is cleared at the start of each request.
 *
 * `isRequesting` is true only while a request is in flight, and is reset on
 * every outcome, so controls disabled on it cannot stick.
 * @returns the request actions and their status.
 */
export const useInlineRequest = (): UseInlineRequest => {
  const [error, setError] = useState<string | undefined>(undefined);

  const onDismissError = useCallback((): void => setError(undefined), []);

  const onErrorRequest = useCallback<RequestFn>(
    async (requestURL, method, payload, options) => {
      setError(undefined);
      return performRequest(requestURL, method, payload, {
        ...options,
        onError: (error) => setError(error.message),
      });
    },
    [],
  );

  const { isRequesting, onRequest } = usePendingRequest(onErrorRequest);

  return {
    actions: { onDismissError, onRequest },
    status: { error, isRequesting },
  };
};
