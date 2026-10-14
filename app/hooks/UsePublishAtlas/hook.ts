import { METHOD } from "@/app/common/entities";
import { useInlineRequest } from "@/app/hooks/UseInlineRequest/hook";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { type OnSubmitOptions, type UsePublishAtlas } from "./entities";
import { getOnPublishSuccess, parsePublishedAtlas } from "./utils";

/**
 * Returns a request function for publishing an atlas. `onSubmit` never rejects:
 * a failure is returned as `error` and resolves `false`; success merges the
 * published atlas from the response into `options.atlasQueryKey`, calls
 * `options.onSuccess`, invalidates `options.invalidateQueryKeys` and resolves
 * `true` once the awaited invalidations have settled.
 *
 * `error` is cleared at the start of every attempt. `isRequesting` is true while
 * the request is in flight and while the awaited invalidations refetch, and is
 * reset on every outcome; `succeeded` is latched on success and never reset, so
 * the publish control stays disabled afterwards — publishing is irreversible,
 * and the endpoint rejects a second attempt.
 * @returns the publish actions and their status.
 */
export const usePublishAtlas = (): UsePublishAtlas => {
  const [succeeded, setSucceeded] = useState(false);
  const queryClient = useQueryClient();
  const {
    actions: { onDismissError, onRequest },
    status: { error, isRequesting },
  } = useInlineRequest();

  const onSubmit = useCallback(
    async (requestURL: string, options?: OnSubmitOptions): Promise<boolean> => {
      return onRequest(requestURL, METHOD.POST, undefined, {
        invalidateQueryKeys: options?.invalidateQueryKeys,
        onSuccess: getOnPublishSuccess(queryClient, setSucceeded, options),
        parseBody: parsePublishedAtlas,
      });
    },
    [onRequest, queryClient],
  );

  return {
    actions: { onDismissError, onSubmit },
    status: { error, isRequesting, succeeded },
  };
};
