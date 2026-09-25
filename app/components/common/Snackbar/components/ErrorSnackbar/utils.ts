/** Id of the body-level element the stack is portalled into. */
export const STACK_CONTAINER_ID = "error-snackbar-stack";

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
