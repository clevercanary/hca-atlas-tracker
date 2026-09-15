import { type RequestFn } from "@/app/common/entities";
import { performRequest } from "@/app/common/requests";
import { usePendingRequest } from "@/app/hooks/UsePendingRequest/hook";
import { useCallback, useRef, useState } from "react";
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

  /*
   * The attempt an incoming failure is allowed to report on. The hook outlives
   * the dialog's visibility, so a request can still be in flight after the
   * dialog it was started from has closed — the title's close button stays live
   * mid-request by design. Clearing on enter and on exited handles the failure
   * that lands while the dialog is closed, but not the reverse order: closing
   * mid-request, reopening, and only then having the first request fail puts a
   * dead confirmation's error in front of a live one, for an irreversible
   * action. Both dismissing and starting a request move this on, so a failure
   * is shown only while it is still the current attempt's.
   */
  const attemptRef = useRef(0);

  const onDismissError = useCallback((): void => {
    attemptRef.current++;
    setError(undefined);
  }, []);

  const onErrorRequest = useCallback<RequestFn>(
    async (requestURL, method, payload, options) => {
      const attempt = ++attemptRef.current;
      setError(undefined);
      return performRequest(requestURL, method, payload, {
        ...options,
        onError: (error) => {
          if (attempt !== attemptRef.current) return;
          setError(error.message);
        },
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
