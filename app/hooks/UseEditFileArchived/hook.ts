import { METHOD } from "@/app/common/entities";
import {
  fetchResource,
  getResponseErrorMessage,
  isFetchStatusOk,
} from "@/app/common/utils";
import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { useCallback } from "react";
import {
  type OnSubmitOptions,
  type Payload,
  type UseEditFileArchived,
} from "./entities";

/**
 * Returns a request function for archiving/unarchiving files. `onSubmit`
 * never rejects: any failure — a non-OK response or a network-level fetch
 * error — is surfaced via the app-level error snackbar (or routed to
 * `options.onError` when given) and resolves `false`; success dismisses a
 * stale error from a previous attempt, calls `options.onSuccess`, and
 * resolves `true`.
 * @returns submit request function, resolving `true` on success.
 */
export const useEditFileArchived = (): UseEditFileArchived => {
  const { onClose: closeSnackbar, onOpen: openSnackbar } = useSnackbar();

  const onSubmit = useCallback(
    async (
      requestURL: string,
      payload: Payload,
      options?: OnSubmitOptions,
    ): Promise<boolean> => {
      const {
        onError = (error: Error): void => openSnackbar(error.message),
        onSuccess,
      } = options ?? {};
      let res: Response;
      try {
        res = await fetchResource(requestURL, METHOD.PATCH, payload);
      } catch (e) {
        onError(e instanceof Error ? e : new Error(String(e)));
        return false;
      }
      if (!isFetchStatusOk(res.status)) {
        onError(new Error(await getResponseErrorMessage(res)));
        return false;
      }
      // Called outside the try above so an exception thrown by onSuccess
      // isn't misreported as a failed request; caught and logged here so it
      // also can't reject onSubmit and break the never-rejects contract (the
      // request itself succeeded).
      try {
        // Dismiss a stale error from a previous attempt.
        closeSnackbar();
        onSuccess?.();
      } catch (e) {
        console.error(e);
      }
      return true;
    },
    [closeSnackbar, openSnackbar],
  );

  return { onSubmit };
};
