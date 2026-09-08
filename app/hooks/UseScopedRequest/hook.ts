import { type RequestFn } from "@/app/common/entities";
import { performRequest } from "@/app/common/requests";
import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { useCallback } from "react";
import { type UseScopedRequest } from "./types";
import { getOperationKey } from "./utils";

/**
 * Performs a request, raising any failure on the app-level error snackbar. The
 * entry is dismissed when the same operation later succeeds.
 *
 * Holds no state of its own: a consumer that disables a control while the
 * request runs wraps this in `usePendingRequest`.
 * @returns the request actions.
 */
export const useScopedRequest = (): UseScopedRequest => {
  const { onDismissOperation, onOpen } = useSnackbar();

  const onRequest = useCallback<RequestFn>(
    async (requestURL, method, payload, options) => {
      const operationKey = getOperationKey(method, requestURL, payload);
      const success = await performRequest(requestURL, method, payload, {
        ...options,
        onError: (error) => onOpen(error.message, operationKey),
      });
      if (success) onDismissOperation(operationKey);
      return success;
    },
    [onDismissOperation, onOpen],
  );

  return { actions: { onRequest } };
};
