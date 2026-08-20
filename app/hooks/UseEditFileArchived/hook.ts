import { METHOD } from "@/app/common/entities";
import { performRequest } from "@/app/common/requests";
import { useErrorSnackbar } from "@/app/components/common/Snackbar/hooks/UseErrorSnackbar/hook";
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
 * (or routed to `options.onError` when given, in which case the snackbar is
 * never touched) and resolves `false`; success calls (and awaits)
 * `options.onSuccess`, dismisses this hook's own stale error from a previous
 * attempt (never one opened by another feature), and resolves `true`.
 * @returns submit request function, resolving `true` on success.
 */
export const useEditFileArchived = (): UseEditFileArchived => {
  const { dismissError, onError: openErrorSnackbar } = useErrorSnackbar();

  const onSubmit = useCallback(
    async (
      requestURL: string,
      payload: Payload,
      options?: OnSubmitOptions,
    ): Promise<boolean> => {
      const { onError = openErrorSnackbar, onSuccess } = options ?? {};
      const success = await performRequest(requestURL, METHOD.PATCH, payload, {
        onError,
        onSuccess,
      });
      // Dismiss this hook's stale error from a previous attempt; scoped, so
      // it's a no-op when the snackbar shows another feature's error or when
      // an onError override kept errors out of the snackbar entirely.
      if (success) dismissError();
      return success;
    },
    [dismissError, openErrorSnackbar],
  );

  return { onSubmit };
};
