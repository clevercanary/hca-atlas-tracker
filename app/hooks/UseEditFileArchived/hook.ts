import { METHOD } from "@/app/common/entities";
import { performRequest } from "@/app/common/requests";
import { useErrorSnackbar } from "@/app/components/common/Snackbar/hooks/UseErrorSnackbar/hook";
import { SNACKBAR_SCOPE } from "@/app/components/common/Snackbar/types";
import { useCallback } from "react";
import {
  type OnSubmitOptions,
  type Payload,
  type UseEditFileArchived,
} from "./entities";

/**
 * Returns a request function for archiving/unarchiving files. `onSubmit`
 * never rejects (see `performRequest`): any failure — a non-OK response or a
 * network-level fetch error — is surfaced via the app-level error snackbar
 * (or routed to `options.onError` when given, in which case this hook opens
 * nothing itself) and resolves `false`; success calls (and awaits)
 * `options.onSuccess`, dismisses this feature's own stale error from a
 * previous attempt (never one opened by another feature), and resolves
 * `true`.
 * @returns submit request function, resolving `true` on success.
 */
export const useEditFileArchived = (): UseEditFileArchived => {
  const { dismissError, onError: openErrorSnackbar } = useErrorSnackbar(
    SNACKBAR_SCOPE.EDIT_FILE_ARCHIVED,
  );

  const onSubmit = useCallback(
    async (
      requestURL: string,
      payload: Payload,
      options?: OnSubmitOptions,
    ): Promise<boolean> => {
      const { onError = openErrorSnackbar, onSuccess } = options ?? {};
      // Only the default handler records a failure under this feature's
      // snackbar scope. An override is free to open the snackbar itself, but
      // whatever it does with the failure isn't this hook's to track — so
      // there's no scoped error of its own to dismiss below.
      const usesDefaultErrorHandling = options?.onError === undefined;
      const success = await performRequest(requestURL, METHOD.PATCH, payload, {
        onError,
        onSuccess,
      });
      // Dismiss this feature's stale error from a previous attempt; scoped, so
      // it's a no-op when the snackbar shows another feature's error.
      if (success && usesDefaultErrorHandling) dismissError();
      return success;
    },
    [dismissError, openErrorSnackbar],
  );

  return { onSubmit };
};
