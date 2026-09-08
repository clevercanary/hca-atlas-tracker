import { METHOD } from "@/app/common/entities";
import { usePendingRequest } from "@/app/hooks/UsePendingRequest/hook";
import { useScopedRequest } from "@/app/hooks/UseScopedRequest/hook";
import { useCallback } from "react";
import {
  type OnSubmitOptions,
  type Payload,
  type UseEditFileArchived,
} from "./entities";

/**
 * Returns a request function for archiving/unarchiving files. `onSubmit` never
 * rejects: a failure is raised on the app-level error snackbar and resolves
 * `false`; success calls (and awaits) `options.onSuccess` and resolves `true`.
 *
 * `isRequesting` is true only while the request is in flight, and is reset on
 * every outcome. Consumers should disable on it rather than tracking the
 * request themselves: the endpoint rejects a repeated archive/unarchive.
 * @returns submit request function and requesting status.
 */
export const useEditFileArchived = (): UseEditFileArchived => {
  const {
    actions: { onRequest: onScopedRequest },
  } = useScopedRequest();
  const { isRequesting, onRequest } = usePendingRequest(onScopedRequest);

  const onSubmit = useCallback(
    async (
      requestURL: string,
      payload: Payload,
      options?: OnSubmitOptions,
    ): Promise<boolean> => {
      return onRequest(requestURL, METHOD.PATCH, payload, {
        onSuccess: options?.onSuccess,
      });
    },
    [onRequest],
  );

  return { isRequesting, onSubmit };
};
