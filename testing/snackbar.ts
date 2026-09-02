import {
  useSnackbar,
  useSnackbarState,
} from "@/app/components/common/Snackbar/provider/hook";
import { SnackbarProvider } from "@/app/components/common/Snackbar/provider/provider";
import {
  type SnackbarActionsContextProps,
  type SnackbarStateContextProps,
} from "@/app/components/common/Snackbar/provider/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, type RenderHookResult } from "@testing-library/react";
import {
  createElement,
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode,
} from "react";

/**
 * What `renderHookWithSnackbar` exposes: the hook under test alongside the
 * snackbar it writes to.
 *
 * Both snackbar contexts are exposed, not just the one a given suite happens to
 * need. `snackbarActions` is only used by suites that simulate an error opened
 * by another feature, but making it conditional would put the provider wiring
 * back in the test files, which is the duplication this helper exists to
 * remove. The actions context is identity-stable by design, so subscribing to
 * it costs no extra renders.
 */
export interface SnackbarRenderResult<T> {
  hook: T;
  snackbar: SnackbarStateContextProps;
  snackbarActions: SnackbarActionsContextProps;
}

/**
 * Reads both snackbar contexts.
 *
 * Exported so a suite that cannot use `renderHook` — see the remount harness in
 * `use-edit-file-archived` — still reads the provider through this module
 * rather than importing its hooks directly. That is what keeps a change to the
 * provider's contract a one-file edit here.
 * @returns the snackbar state and actions.
 */
export function useSnackbarContexts(): Omit<
  SnackbarRenderResult<never>,
  "hook"
> {
  return { snackbar: useSnackbarState(), snackbarActions: useSnackbar() };
}

/**
 * The `result` handle `renderHookWithSnackbar` returns, for suites that pass it
 * to their own submit helper. A named alias rather than an inline
 * `{ current: … }`, which jsdoc would treat as a destructured parameter and
 * demand per-property docs for.
 */
export type SnackbarHookResult<T> = RenderHookResult<
  SnackbarRenderResult<T>,
  unknown
>["result"];

/**
 * Runs an async call inside `act` and returns its resolved value.
 *
 * The mutation hooks' `onSubmit` updates both hook state and snackbar state, so
 * it has to be awaited inside `act` or React warns and the assertions race the
 * commit. Signatures differ per hook (payload, options), so this wraps the
 * `act` boilerplate rather than the call itself — each suite still names its
 * own arguments.
 * @param call - Call to run inside `act`.
 * @returns whatever the call resolves to.
 */
export async function actAsync<T>(call: () => Promise<T>): Promise<T> {
  let resolved: T;
  await act(async () => {
    resolved = await call();
  });
  // Assigned by the awaited `act` callback above, which TypeScript can't see.
  return resolved!;
}

/**
 * Renders a hook under a real `SnackbarProvider`, exposing the hook and the
 * snackbar state and actions.
 *
 * A real provider rather than a mocked context: these suites exist to check the
 * hooks' default error handling end to end — that a failure actually reaches
 * the snackbar, and that a scoped dismissal does or doesn't close it — which a
 * mock would assert against itself.
 *
 * Shared so that a change to the provider's contract is one edit here rather
 * than the same edit in every suite that renders it.
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
 * Wraps children in a `SnackbarProvider`. Exported for the same reason as
 * `useSnackbarContexts`: suites composing their own tree still name the
 * provider once, here.
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
 * that use both — `useQueryClient` for invalidation, `useSnackbar` for error
 * reporting.
 *
 * Shared for the same reason as `renderHookWithSnackbar`: this pairing was
 * copy-pasted under two different names, so the provider wiring lived in as
 * many places as there were suites using it.
 * @param queryClient - Query client to provide; pass one in to spy on it.
 * @returns Wrapper component providing the QueryClient and the snackbar.
 */
export function createQuerySnackbarWrapper(
  queryClient = new QueryClient(),
): FunctionComponent<PropsWithChildren> {
  return function QuerySnackbarWrapper({
    children,
  }: PropsWithChildren): ReactNode {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      withSnackbarProvider({ children }),
    );
  };
}
