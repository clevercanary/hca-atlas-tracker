import { METHOD } from "@/app/common/entities";
import { performRequest } from "@/app/common/requests";
import { useErrorSnackbar } from "@/app/components/common/Snackbar/hooks/UseErrorSnackbar/hook";
import { SNACKBAR_SCOPE } from "@/app/components/common/Snackbar/types";
import { useCallback, useState } from "react";
import { type OnSubmitOptions, type UsePublishAtlas } from "./entities";

/**
 * Returns a request function for publishing an atlas. `onSubmit` never
 * rejects (see `performRequest`): any failure — a non-OK response or a
 * network-level fetch error — is surfaced via the app-level error snackbar
 * and resolves `false`; success dismisses this feature's own stale error from
 * a previous attempt, calls `options.onSuccess`, and resolves `true`.
 * `isRequesting` is true only while the request is in flight — it's reset on
 * every outcome, so buttons disabled on it can't get stuck.
 * @returns submit request function and requesting status.
 */
export const usePublishAtlas = (): UsePublishAtlas => {
  const [isRequesting, setIsRequesting] = useState(false);
  const { dismissError, onError } = useErrorSnackbar(
    SNACKBAR_SCOPE.PUBLISH_ATLAS,
  );

  const onSubmit = useCallback(
    async (requestURL: string, options?: OnSubmitOptions): Promise<boolean> => {
      setIsRequesting(true);
      // performRequest never rejects, so isRequesting is always reset.
      const success = await performRequest(requestURL, METHOD.POST, undefined, {
        onError,
        onSuccess: options?.onSuccess,
      });
      setIsRequesting(false);
      // Dismiss this feature's stale error from a previous attempt (scoped;
      // see useErrorSnackbar).
      if (success) dismissError();
      return success;
    },
    [dismissError, onError],
  );

  return { isRequesting, onSubmit };
};
