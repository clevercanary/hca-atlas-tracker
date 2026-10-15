import { METHOD } from "@/app/common/entities";
import { useInlineRequest } from "@/app/hooks/UseInlineRequest/hook";
import { useCallback } from "react";
import { type OnSubmitOptions, type UsePublishAtlas } from "./entities";

/**
 * Returns a request function for publishing an atlas. `onSubmit` never rejects:
 * a failure is returned as `error` and resolves `false`. Once the server
 * accepts the request, `options.invalidateQueryKeys` are invalidated; success
 * then calls `options.onSuccess`, and resolves `true` once the awaited
 * invalidations have settled.
 *
 * `error` is cleared at the start of every attempt. `isRequesting` is true while
 * the request is in flight and while the awaited invalidations refetch, and is
 * reset on every outcome. Nothing here records that the publish succeeded: the
 * refetched atlas does, and the publish control is disabled from it.
 * @returns the publish actions and their status.
 */
export const usePublishAtlas = (): UsePublishAtlas => {
  const {
    actions: { onDismissError, onRequest },
    status: { error, isRequesting },
  } = useInlineRequest();

  const onSubmit = useCallback(
    async (requestURL: string, options?: OnSubmitOptions): Promise<boolean> => {
      return onRequest(requestURL, METHOD.POST, undefined, {
        invalidateQueryKeys: options?.invalidateQueryKeys,
        onSuccess: options?.onSuccess,
      });
    },
    [onRequest],
  );

  return {
    actions: { onDismissError, onSubmit },
    status: { error, isRequesting },
  };
};
