import { type RequestFn } from "@/app/common/entities";
import { onRequestSuccess, performRequest } from "@/app/common/requests";
import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { type UseScopedRequest } from "./types";
import { getOperationKey } from "./utils";

/**
 * Performs a request, raising any failure on the app-level error snackbar. The
 * entry is dismissed when the same operation later succeeds. On success the
 * caches declared in `options.invalidateQueryKeys` are invalidated, and the
 * request resolves once the awaited ones have refetched (see
 * `onRequestSuccess`).
 *
 * Holds no state of its own: a consumer that disables a control while the
 * request runs wraps this in `usePendingRequest`.
 * @returns the request actions.
 */
export const useScopedRequest = (): UseScopedRequest => {
  const { onDismissOperation, onOpen } = useSnackbar();
  const queryClient = useQueryClient();

  const onRequest = useCallback<RequestFn>(
    async (requestURL, method, payload, options) => {
      const operationKey = getOperationKey(method, requestURL, payload);
      const success = await performRequest(requestURL, method, payload, {
        isSuccessStatus: options?.isSuccessStatus,
        onError: (error) => onOpen(error.message, operationKey),
        onSuccess: (res) => onRequestSuccess(queryClient, res, options),
      });
      if (success) onDismissOperation(operationKey);
      return success;
    },
    [onDismissOperation, onOpen, queryClient],
  );

  return { actions: { onRequest } };
};
