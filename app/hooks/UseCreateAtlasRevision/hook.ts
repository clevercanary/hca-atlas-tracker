import { METHOD } from "@/app/common/entities";
import { isFetchStatusCreated } from "@/app/common/utils";
import { useInlineRequest } from "@/app/hooks/UseInlineRequest/hook";
import { useCallback, useState } from "react";
import { type OnSubmitOptions, type UseCreateAtlasRevision } from "./entities";

/**
 * Returns a request function for creating an atlas revision. `onSubmit` never
 * rejects: a failure is returned as `error` and resolves `false`; success calls
 * `options.onSuccess` with the created atlas and resolves `true`.
 *
 * `error` is cleared at the start of every attempt. `isRequesting` is true only
 * while the request is in flight, and is reset on every outcome; `succeeded`
 * stays true so buttons remain disabled through the navigation that follows.
 * @returns the create-revision actions and their status.
 */
export const useCreateAtlasRevision = (): UseCreateAtlasRevision => {
  const [succeeded, setSucceeded] = useState(false);
  const {
    actions: { onDismissError, onRequest },
    status: { error, isRequesting },
  } = useInlineRequest();

  const onSubmit = useCallback(
    async (requestURL: string, options?: OnSubmitOptions): Promise<boolean> => {
      setSucceeded(false);
      const success = await onRequest(requestURL, METHOD.POST, undefined, {
        // The endpoint answers 201, not 200.
        isSuccessStatus: isFetchStatusCreated,
        onSuccess: async (res) => options?.onSuccess?.(await res.json()),
      });
      if (success) setSucceeded(true);
      return success;
    },
    [onRequest],
  );

  return {
    actions: { onDismissError, onSubmit },
    status: { error, isRequesting, succeeded },
  };
};
