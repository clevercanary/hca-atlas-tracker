/** Kinds of entry on the app-level stack. */
export const SNACKBAR_SEVERITY = {
  ERROR: "error",
  SUCCESS: "success",
} as const;

/** How long a success entry stays up before it closes itself, in ms. */
export const SUCCESS_AUTO_HIDE_DURATION = 6000;
