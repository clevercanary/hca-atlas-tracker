import { type Dispatch, type SetStateAction } from "react";

/**
 * Returns the publish request's `onSuccess`: it latches `succeeded`, then calls
 * the caller's own `onSuccess`. Latched there — inside the pending window, while
 * `isRequesting` is still true — rather than once the request resolves, so the
 * publish control's disabled state never depends on how React batches the reset
 * of one flag with the setting of the other.
 * @param setSucceeded - Setter for the `succeeded` latch.
 * @param onSuccess - Caller's success callback, if any.
 * @returns success callback for the request.
 */
export function latchOnSuccess(
  setSucceeded: Dispatch<SetStateAction<boolean>>,
  onSuccess: (() => void) | undefined,
): () => void {
  return (): void => {
    setSucceeded(true);
    onSuccess?.();
  };
}
