import { type RequestFn } from "@/app/common/entities";
import { invalidateQueryCaches, performRequest } from "@/app/common/requests";
import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { type UseScopedRequest } from "./types";
import { getOperationKey } from "./utils";

/**
 * Performs a request, raising any failure on the app-level error snackbar. The
 * entry is dismissed as soon as the same operation is later accepted by the
 * server — before the awaited invalidations refetch, so a stale "failed"
 * message doesn't outlive the retry that fixed it; should that retry's body
 * then prove unreadable, its own failure replaces it. Once the server accepts
 * the request the caches declared in `options.invalidateQueryKeys` are
 * invalidated, whether or not its body can be read, and the request resolves
 * once the awaited ones have refetched (see `invalidateQueryCaches`).
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
      // reaches `performRequest`; only the one handled here is picked off.
      const { invalidateQueryKeys, ...performOptions } = options ?? {};
      return performRequest(requestURL, method, payload, {
        ...performOptions,
        onCommitted: () => {
          // Started first: it dispatches every declared key synchronously, so
          // a throwing dismiss can't skip the invalidations.
          const invalidated = invalidateQueryCaches(
            queryClient,
            invalidateQueryKeys,
          );
          onDismissOperation(operationKey);
          return invalidated;
        },
        onError: (error) => onOpen(error.message, operationKey),
      });
    },
    [onDismissOperation, onOpen, queryClient],
  );

  return { actions: { onRequest } };
};
