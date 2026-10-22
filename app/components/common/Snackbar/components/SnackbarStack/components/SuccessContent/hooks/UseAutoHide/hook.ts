import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { type SnackbarEntry } from "@/app/components/common/Snackbar/provider/types";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { AUTO_HIDE_HOLD } from "./constants";
import {
  type AutoHideHold,
  type AutoHideTimer,
  type UseAutoHide,
} from "./types";
import {
  clearTimer,
  holdTimer,
  holdWhileWindowBlurred,
  releaseTimer,
  startTimer,
} from "./utils";

/**
 * Closes an entry once `duration` has passed, the way MUI `Snackbar`'s
 * `autoHideDuration` does — MUI's own `useSnackbar` hook isn't in its public
 * exports, and its `Snackbar` positions itself, which the stack already does.
 *
 * The countdown stops while the pointer is over the entry, while focus is
 * inside it, and while the window is in the background (including when the
 * entry opens into a window that already is). Once the last of those lets go
 * it resumes with `RESUME_FRACTION` of the duration, as MUI's does, rather than
 * with whatever was left. Unlike MUI's, each is tracked separately, so the
 * pointer leaving doesn't restart the countdown while focus is still inside.
 *
 * Runs from mount to unmount. A timer that fires after the entry was closed
 * some other way is harmless: closing an entry that is already closed leaves
 * the stack unchanged (see `closeEntry`).
 * @param id - Entry to close.
 * @param duration - Milliseconds before the entry closes itself.
 * @returns handlers to spread on the entry's root.
 */
export const useAutoHide = (
  id: SnackbarEntry["id"],
  duration: number,
): UseAutoHide => {
  const { onClose } = useSnackbar();
  const holdsRef = useRef(new Set<AutoHideHold>());
  const timerRef = useRef<AutoHideTimer>(undefined);

  const onTimeout = useCallback((): void => onClose(id), [id, onClose]);

  const hold = useCallback(
    (reason: AutoHideHold): void =>
      holdTimer(holdsRef.current, timerRef, reason),
    [],
  );

  const release = useCallback(
    (reason: AutoHideHold): void =>
      releaseTimer(holdsRef.current, timerRef, onTimeout, duration, reason),
    [duration, onTimeout],
  );

  useEffect(() => {
    const stopListening = holdWhileWindowBlurred(
      holdsRef.current,
      hold,
      release,
    );
    if (holdsRef.current.size === 0) startTimer(timerRef, onTimeout, duration);
    return (): void => {
      stopListening();
      clearTimer(timerRef);
    };
  }, [duration, hold, onTimeout, release]);

  // Inline rather than built in `utils.ts`: the React compiler's refs rule
  // reads handing `hold`/`release` to a function during render as reading the
  // refs they close over.
  return useMemo(
    () => ({
      onBlur: (): void => release(AUTO_HIDE_HOLD.FOCUS),
      onFocus: (): void => hold(AUTO_HIDE_HOLD.FOCUS),
      onMouseEnter: (): void => hold(AUTO_HIDE_HOLD.HOVER),
      onMouseLeave: (): void => release(AUTO_HIDE_HOLD.HOVER),
    }),
    [hold, release],
  );
};
