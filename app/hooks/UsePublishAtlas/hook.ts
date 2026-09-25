import { METHOD } from "@/app/common/entities";
import { useInlineRequest } from "@/app/hooks/UseInlineRequest/hook";
import { useCallback } from "react";
import { type OnSubmitOptions, type UsePublishAtlas } from "./entities";

/**
 * Returns a request function for publishing an atlas. `onSubmit` never rejects:
 * a failure is returned as `error` and resolves `false`; success calls
 * `options.onSuccess` and resolves `true`.
 *
 * `error` is cleared at the start of every attempt. `isRequesting` is true only
 * while the request is in flight, and is reset on every outcome.
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
