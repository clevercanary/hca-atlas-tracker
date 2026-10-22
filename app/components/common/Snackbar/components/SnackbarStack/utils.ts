import { SNACKBAR_SEVERITY } from "@/app/components/common/Snackbar/provider/constants";
import {
  type SnackbarEntry,
  type SuccessSnackbarEntry,
} from "@/app/components/common/Snackbar/provider/types";

/** Id of the body-level element the stack is portalled into. */
export const STACK_CONTAINER_ID = "snackbar-stack";

/**
 * Returns the body-level element the stack is portalled into, creating it on
 * the first call.
 *
 * Created during render rather than left to `Portal`, which appends its own
 * node in an effect. MUI's `ariaHiddenSiblings` snapshots
 * `document.body.children` when a modal *mounts*, so with a modal open in the
 * same commit as the provider, `Portal`'s node isn't in `body` yet at snapshot
 * time and the stack is never marked — measured: the stack sat directly under
 * `body` with no `aria-hidden` ancestor at all. React finishes the whole render
 * phase before any effect runs, so creating the element here puts it in `body`
 * ahead of every modal's snapshot.
 *
 * Idempotent, so React's double-invoked initializers return the same element
 * rather than stacking up empty divs.
 * @returns the container, or undefined on the server, where `Portal` renders
 * nothing anyway.
 */
export function getStackContainer(): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  const existing = document.getElementById(STACK_CONTAINER_ID);
  if (existing) return existing;
  const container = document.createElement("div");
  container.id = STACK_CONTAINER_ID;
  document.body.appendChild(container);
  return container;
}

/**
 * Returns the id of the element holding an entry's message, which its close
 * button is described by.
 * @param entryId - Entry id.
 * @returns message element id.
 */
export function getMessageId(entryId: SnackbarEntry["id"]): string {
  return `${entryId}-message`;
}

/**
 * Returns the success entries on the stack, in stack order.
 * @param entries - Entries on the stack.
 * @returns the success entries.
 */
export function getSuccessEntries(
  entries: SnackbarEntry[],
): SuccessSnackbarEntry[] {
  return entries.filter(
    (entry): entry is SuccessSnackbarEntry =>
      entry.severity === SNACKBAR_SEVERITY.SUCCESS,
  );
}
