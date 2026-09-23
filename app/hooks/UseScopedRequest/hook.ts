import { type RequestFn } from "@/app/common/entities";
import { onRequestSuccess, performRequest } from "@/app/common/requests";
import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { type UseScopedRequest } from "./types";
import { getOperationKey } from "./utils";

/**
 * Performs a request, raising any failure on the app-level error snackbar. The
 * entry is dismissed as soon as the same operation later succeeds — before the
 * awaited invalidations refetch, so a stale "failed" message doesn't outlive
 * the retry that fixed it. On success the caches declared in
 * `options.invalidateQueryKeys` are invalidated, and the request resolves once
 * the awaited ones have refetched (see `onRequestSuccess`).
 *
 * Holds no state of its own: a consumer that disables a control while the
 * request runs wraps this in `usePendingRequest`.
 * @returns the request actions.
 */
export const useScopedRequest = (): UseScopedRequest => {
  const { onDismissOperation, onOpen } = useSnackbar();
  const queryClient = useQueryClient();

  const onRequest = useCallback<RequestFn>(
    (requestURL, method, payload, options) => {
      const operationKey = getOperationKey(method, requestURL, payload);
      // Rest-spread so an option added to `PerformRequestOptions` later still
      // reaches `performRequest`; only the two handled here are picked off.
      const { invalidateQueryKeys, onSuccess, ...performOptions } =
        options ?? {};
      return performRequest(requestURL, method, payload, {
        ...performOptions,
        onError: (error) => onOpen(error.message, operationKey),
        onSuccess: (res) => {
          onDismissOperation(operationKey);
          return onRequestSuccess(queryClient, res, {
            invalidateQueryKeys,
            onSuccess,
          });
        },
      });
    },
    [onDismissOperation, onOpen, queryClient],
  );

  return { actions: { onRequest } };
};
