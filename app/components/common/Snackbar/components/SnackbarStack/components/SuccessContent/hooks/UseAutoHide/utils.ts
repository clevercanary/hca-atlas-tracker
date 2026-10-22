import { type RefObject } from "react";
import { AUTO_HIDE_HOLD, RESUME_FRACTION } from "./constants";
import { type AutoHideHold, type AutoHideTimer } from "./types";

/**
 * Cancels a pending timeout, if there is one.
 * @param timerRef - Ref holding the pending timeout.
 */
export function clearTimer(timerRef: RefObject<AutoHideTimer>): void {
  clearTimeout(timerRef.current);
  timerRef.current = undefined;
}

/**
 * Stops the countdown for a reason, until that reason is released.
 * @param holds - Reasons currently holding the timer.
 * @param timerRef - Ref holding the pending timeout.
 * @param reason - Reason to hold for.
 */
export function holdTimer(
  holds: Set<AutoHideHold>,
  timerRef: RefObject<AutoHideTimer>,
  reason: AutoHideHold,
): void {
  holds.add(reason);
  clearTimer(timerRef);
}

/**
 * Holds the timer while the window is in the background, and from the start if
 * it already is when the entry opens.
 * @param holds - Reasons currently holding the timer.
 * @param hold - Holds the timer for a reason.
 * @param release - Releases the timer for a reason.
 * @returns a function that removes the listeners.
 */
export function holdWhileWindowBlurred(
  holds: Set<AutoHideHold>,
  hold: (reason: AutoHideHold) => void,
  release: (reason: AutoHideHold) => void,
): () => void {
  if (!document.hasFocus()) holds.add(AUTO_HIDE_HOLD.WINDOW);
  const onWindowBlur = (): void => hold(AUTO_HIDE_HOLD.WINDOW);
  const onWindowFocus = (): void => release(AUTO_HIDE_HOLD.WINDOW);
  window.addEventListener("blur", onWindowBlur);
  window.addEventListener("focus", onWindowFocus);
  return (): void => {
    window.removeEventListener("blur", onWindowBlur);
    window.removeEventListener("focus", onWindowFocus);
  };
}

/**
 * Lets go of one reason, and resumes the countdown with `RESUME_FRACTION` of
 * the duration once nothing holds it any more. Releasing a reason that wasn't
 * held does nothing.
 * @param holds - Reasons currently holding the timer.
 * @param timerRef - Ref holding the pending timeout.
 * @param onTimeout - Called when the countdown runs out.
 * @param duration - Full duration, in ms.
 * @param reason - Reason to release.
 */
export function releaseTimer(
  holds: Set<AutoHideHold>,
  timerRef: RefObject<AutoHideTimer>,
  onTimeout: () => void,
  duration: number,
  reason: AutoHideHold,
): void {
  if (!holds.delete(reason) || holds.size > 0) return;
  startTimer(timerRef, onTimeout, duration * RESUME_FRACTION);
}

/**
 * (Re)starts the timeout, replacing any pending one.
 * @param timerRef - Ref holding the pending timeout.
 * @param onTimeout - Called when it fires.
 * @param duration - Milliseconds until it fires.
 */
export function startTimer(
  timerRef: RefObject<AutoHideTimer>,
  onTimeout: () => void,
  duration: number,
): void {
  clearTimer(timerRef);
  timerRef.current = setTimeout(onTimeout, duration);
}
