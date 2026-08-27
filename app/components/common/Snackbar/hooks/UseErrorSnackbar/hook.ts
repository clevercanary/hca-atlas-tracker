import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { type SnackbarScope } from "@/app/components/common/Snackbar/types";
import { useCallback } from "react";
import { type UseErrorSnackbar } from "./types";

/**
 * App-level error snackbar handling scoped to the calling feature: `onError`
 * opens the snackbar with the error's message; `dismissError` dismisses only a
 * message opened by the same scope, and only while it's still the one showing
 * — so dismissing a stale error can't dismiss an unread error owned by an
 * unrelated feature.
 * Ownership is keyed on the feature scope, not on the hook instance: the
 * provider is mounted in `_app` and outlives page navigation, so a stale error
 * raised by this feature on one page is still dismissable by the same
 * feature's next success on another page, where the hook has remounted.
 * @param scope - Feature that owns the messages this hook opens.
 * @returns error handler and scoped dismisser.
 */
export const useErrorSnackbar = (scope: SnackbarScope): UseErrorSnackbar => {
  const { onClose, onOpen } = useSnackbar();

  const dismissError = useCallback((): void => {
    onClose(scope);
  }, [onClose, scope]);

  const onError = useCallback(
    (error: Error): void => {
      onOpen(error.message, scope);
    },
    [onOpen, scope],
  );

  return { dismissError, onError };
};
