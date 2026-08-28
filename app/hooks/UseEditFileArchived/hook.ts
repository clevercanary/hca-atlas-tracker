import { METHOD } from "@/app/common/entities";
import { performRequest } from "@/app/common/requests";
import { useErrorSnackbar } from "@/app/components/common/Snackbar/hooks/UseErrorSnackbar/hook";
import { SNACKBAR_SCOPE } from "@/app/components/common/Snackbar/types";
import { useCallback, useState } from "react";
import {
  type OnSubmitOptions,
  type Payload,
  type UseEditFileArchived,
} from "./entities";

/**
 * Returns a request function for archiving/unarchiving files. `onSubmit`
 * never rejects (see `performRequest`): any failure — a non-OK response or a
 * network-level fetch error — is surfaced via the app-level error snackbar and
 * resolves `false`; success calls (and awaits) `options.onSuccess`, dismisses
 * this feature's own stale error from a previous attempt (never one opened by
 * another feature), and resolves `true`.
 * `isRequesting` is true only while the request is in flight — it's reset on
 * every outcome, so buttons disabled on it can't get stuck. Consumers should
 * disable on it rather than tracking the request themselves: the endpoint
 * rejects a repeated archive/unarchive, so a double-click would otherwise
 * surface an error for an action that succeeded.
 * @returns submit request function and requesting status.
 */
export const useEditFileArchived = (): UseEditFileArchived => {
  const [isRequesting, setIsRequesting] = useState(false);
  const { dismissError, onError } = useErrorSnackbar(
    SNACKBAR_SCOPE.EDIT_FILE_ARCHIVED,
  );

  const onSubmit = useCallback(
    async (
      requestURL: string,
      payload: Payload,
      options?: OnSubmitOptions,
    ): Promise<boolean> => {
      setIsRequesting(true);
      // performRequest never rejects, so isRequesting is always reset.
      const success = await performRequest(requestURL, METHOD.PATCH, payload, {
        onError,
        onSuccess: options?.onSuccess,
      });
      setIsRequesting(false);
      // Dismiss this feature's stale error from a previous attempt; scoped, so
      // it's a no-op when the snackbar shows another feature's error.
      if (success) dismissError();
      return success;
    },
    [dismissError, onError],
  );

  return { isRequesting, onSubmit };
};
