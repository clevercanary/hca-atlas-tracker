import { METHOD } from "@/app/common/entities";
import { performRequest } from "@/app/common/requests";
import { isFetchStatusCreated } from "@/app/common/utils";
import { useErrorSnackbar } from "@/app/components/common/Snackbar/hooks/UseErrorSnackbar/hook";
import { SNACKBAR_SCOPE } from "@/app/components/common/Snackbar/types";
import { useCallback, useState } from "react";
import { type OnSubmitOptions, type UseCreateAtlasRevision } from "./entities";

/**
 * Returns a request function for creating an atlas revision. `onSubmit` never
 * rejects (see `performRequest`): any failure — a non-201 response or a
 * network-level fetch error — is surfaced via the app-level error snackbar and
 * resolves `false`; success dismisses this feature's own stale error from a
 * previous attempt, calls `options.onSuccess` with the created atlas, and
 * resolves `true`.
 * The snackbar is used rather than a thrown error so a failed "Create New
 * Version" behaves like a failed "Publish" from the adjacent button in
 * `AtlasView`, instead of replacing the page with the error boundary.
 * `isRequesting` is true only while the request is in flight — it's reset on
 * every outcome, so buttons disabled on it can't get stuck; `succeeded` stays
 * true so they remain disabled through the navigation that follows.
 * @returns submit request function, requesting status and success status.
 */
export const useCreateAtlasRevision = (): UseCreateAtlasRevision => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const { dismissError, onError } = useErrorSnackbar(
    SNACKBAR_SCOPE.CREATE_ATLAS_REVISION,
  );

  const onSubmit = useCallback(
    async (requestURL: string, options?: OnSubmitOptions): Promise<boolean> => {
      setSucceeded(false);
      setIsRequesting(true);
      // performRequest never rejects, so isRequesting is always reset.
      const success = await performRequest(requestURL, METHOD.POST, undefined, {
        // The endpoint answers 201, not 200.
        isSuccessStatus: isFetchStatusCreated,
        onError,
        onSuccess: async (res) => options?.onSuccess?.(await res.json()),
      });
      setIsRequesting(false);
      if (success) {
        setSucceeded(true);
        // Dismiss this feature's stale error from a previous attempt (scoped;
        // see useErrorSnackbar).
        dismissError();
      }
      return success;
    },
    [dismissError, onError],
  );

  return { isRequesting, onSubmit, succeeded };
};
