/**
 * Things that hold an auto-hide timer: the pointer over the entry, focus inside
 * it, and the window being in the background. While any is held the timer is
 * stopped, so an entry can't disappear while it is being read or out of sight.
 */
export const AUTO_HIDE_HOLD = {
  FOCUS: "FOCUS",
  HOVER: "HOVER",
  WINDOW: "WINDOW",
} as const;

/**
 * Fraction of the full duration that runs once the last hold is released —
 * MUI `Snackbar`'s default `resumeHideDuration`.
 */
export const RESUME_FRACTION = 0.5;
