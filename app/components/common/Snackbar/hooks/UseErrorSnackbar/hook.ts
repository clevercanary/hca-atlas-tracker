import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { useCallback, useRef } from "react";
import { type UseErrorSnackbar } from "./types";

/**
 * App-level error snackbar handling scoped to the calling feature: `onError`
 * opens the snackbar with the error's message; `dismissError` dismisses only
 * an error this hook instance opened, and only while it's still the message
 * showing — so dismissing a stale error from a previous attempt can't dismiss
 * an unread error owned by an unrelated feature.
 * @returns error handler and scoped dismisser.
 */
export const useErrorSnackbar = (): UseErrorSnackbar => {
  const { onClose, onOpen } = useSnackbar();
  // Handle of the error this hook instance opened, if any.
  const errorIdRef = useRef<number | undefined>(undefined);

  const dismissError = useCallback((): void => {
    if (errorIdRef.current === undefined) return;
    onClose(errorIdRef.current);
    errorIdRef.current = undefined;
  }, [onClose]);

  const onError = useCallback(
    (error: Error): void => {
      errorIdRef.current = onOpen(error.message);
    },
    [onOpen],
  );

  return { dismissError, onError };
};
