import {
  useSnackbar,
  useSnackbarState,
} from "@/app/components/common/Snackbar/provider/hook";
import { SnackbarProvider } from "@/app/components/common/Snackbar/provider/provider";
import {
  type SnackbarActionsContextProps,
  type SnackbarStateContextProps,
} from "@/app/components/common/Snackbar/provider/types";
import { createQueryClientWrapper } from "@/testing/query";
import { type QueryClient } from "@tanstack/react-query";
import { act, renderHook, type RenderHookResult } from "@testing-library/react";
import {
  createElement,
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode,
} from "react";

// Re-exported so suites reading the contexts outside `renderHookWithSnackbar`
// don't import the provider's own types, which would put a reshape of either
// context back into every suite.
export { type SnackbarActionsContextProps, type SnackbarStateContextProps };

/** Both snackbar contexts, as a suite sees them. */
export interface SnackbarContexts {
  snackbar: SnackbarStateContextProps;
  snackbarActions: SnackbarActionsContextProps;
}

/**
 * What `renderHookWithSnackbar` exposes: the hook under test alongside the
 * snackbar it writes to.
 *
 * Both contexts are exposed, not just the one a given suite needs.
 * `snackbarActions` is used only by suites simulating an error opened by
 * another feature, but making it conditional would put provider wiring back in
 * the test files. The actions context is identity-stable, so subscribing to it
 * costs no extra renders.
 */
export interface SnackbarRenderResult<T> extends SnackbarContexts {
  hook: T;
}

/**
 * The `result` handle `renderHookWithSnackbar` returns, for suites passing it
 * to their own submit helper.
 *
 * Takes the hook itself rather than its return type, matching
 * `renderHookWithSnackbar`, so a suite writes `SnackbarHookResult<typeof useX>`
 * without restating `ReturnType` at every call site.
 */
export type SnackbarHookResult<H extends () => unknown> = RenderHookResult<
  SnackbarRenderResult<ReturnType<H>>,
  unknown
>["result"];

/**
 * Runs an async call inside `act` and returns its resolved value.
 *
 * The mutation hooks' `onSubmit` updates both hook state and snackbar state, so
 * it has to be awaited inside `act` or React warns and assertions race the
 * commit. Signatures differ per hook (payload, options), so this wraps the
 * `act` boilerplate rather than the call — each suite still names its own
 * arguments.
 *
 * `async` is load-bearing, and dropping it fails 13 tests across the three
 * suites: RTL wraps React's `act` so that an async callback yields a
 * hand-rolled thenable rather than a real promise (`act-compat.js`), and
 * handing that straight back to the caller leaves the queued work undrained
 * where the assertions run. An `async` function resolves it into a real promise
 * on the way out, which is what drains it. The `await` is *not* what matters —
 * `return act(call)` inside this async function passes all 23.
 * @param call - Call to run inside `act`.
 * @returns whatever the call resolves to.
 */
export async function actAsync<T>(call: () => Promise<T>): Promise<T> {
  return act(call);
}

/**
 * Reads both snackbar contexts.
 *
 * Exported so a suite that cannot use `renderHook` — see the remount harness in
 * `use-edit-file-archived`, which needs the consumer to unmount independently
 * of the provider — still reads the provider through this module.
 * @returns the snackbar state and actions.
 */
export function useSnackbarContexts(): SnackbarContexts {
  return { snackbar: useSnackbarState(), snackbarActions: useSnackbar() };
}

/**
 * Renders a hook under a real `SnackbarProvider`, exposing the hook and the
 * snackbar state and actions.
 *
 * A real provider rather than a mocked context: these suites exist to check the
 * hooks' default error handling end to end — that a failure actually reaches
 * the snackbar, and that a scoped dismissal does or doesn't close it — which a
 * mock would assert against itself.
 * @param useHookUnderTest - Hook to render.
 * @returns render result exposing the hook and the snackbar.
 */
export function renderHookWithSnackbar<T>(
  useHookUnderTest: () => T,
): RenderHookResult<SnackbarRenderResult<T>, unknown> {
  return renderHook(
    () => ({ hook: useHookUnderTest(), ...useSnackbarContexts() }),
    { wrapper: withSnackbarProvider },
  );
}

/**
 * Wraps children in a `SnackbarProvider`.
 * @param props - Wrapper props.
 * @param props.children - React children.
 * @returns children under a snackbar provider.
 */
export function withSnackbarProvider({
  children,
}: PropsWithChildren): ReactNode {
  return createElement(SnackbarProvider, null, children);
}

/**
 * Builds a wrapper providing a QueryClient alongside the snackbar, for hooks
 * using both — `useQueryClient` for invalidation, `useSnackbar` for error
 * reporting.
 * @param queryClient - Query client to provide; pass one in to spy on it.
 * @returns Wrapper component providing the QueryClient and the snackbar.
 */
export function createQuerySnackbarWrapper(
  queryClient?: QueryClient,
): FunctionComponent<PropsWithChildren> {
  const QueryWrapper = createQueryClientWrapper(queryClient);
  return function QuerySnackbarWrapper({
    children,
  }: PropsWithChildren): ReactNode {
    return createElement(
      QueryWrapper,
      null,
      createElement(withSnackbarProvider, null, children),
    );
  };
}
