import { METHOD } from "@/app/common/entities";
import { usePendingRequest } from "@/app/hooks/UsePendingRequest/hook";
import { useScopedRequest } from "@/app/hooks/UseScopedRequest/hook";
import { useCallback } from "react";
import {
  type OnSubmitOptions,
  type Payload,
  type UseEditFileArchived,
} from "./types";

/**
 * Returns a request function for archiving/unarchiving files. `onSubmit` never
 * rejects: a failure is raised on the app-level error snackbar and resolves
 * `false`; success calls `options.onSuccess`, invalidates
 * `options.invalidateQueryKeys` and resolves `true` once the awaited
 * invalidations have settled.
 *
 * The invalidations are performed by the request layer
 * (`invalidateQueryCaches`) rather than by the call site, so the pending window
 * a caller declares can't be lost to a forgotten `return`, and a throwing
 * `onSuccess` can't skip them.
 *
 * `isRequesting` is true while the request is in flight and while the awaited
 * invalidations refetch, and is reset on every outcome. Consumers should
 * disable on it rather than tracking the request themselves: the endpoint
 * rejects a repeated archive/unarchive.
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
      return onRequest(requestURL, METHOD.PATCH, payload, options);
    },
    [onRequest],
  );

  return { isRequesting, onSubmit };
};
