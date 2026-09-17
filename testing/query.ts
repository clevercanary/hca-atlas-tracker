import { makeQueryClient } from "@/app/query/queryClient";
import { promiseWithResolvers } from "@/testing/utils";
import {
  QueryClient,
  QueryClientProvider,
  type QueryKey,
} from "@tanstack/react-query";
import {
  createElement,
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode,
} from "react";

/**
 * Builds a wrapper providing a QueryClient, for hooks that read the cache or
 * invalidate keys.
 *
 * Defaults to `makeQueryClient()` — the app's own configuration — rather than a
 * bare `new QueryClient()`. The library default retries a failed query three
 * times with exponential backoff, so a suite asserting an error state through a
 * bare client waits seconds before that state exists and a default `waitFor`
 * times out instead. `makeQueryClient` sets `retry: false`, which is also what
 * the suites that hit failure paths were already doing by hand.
 *
 * Note what else that default carries: `throwOnError: true`. A suite asserting
 * `isError` on an ungated query through this default will not reach it — the
 * rejection is rethrown during render and surfaces as an uncaught error. Pass
 * `new QueryClient({ defaultOptions: { queries: { retry: false } } })` for that
 * case. Today's default-wrapper consumers all go through `useAuthedQuery`,
 * which gates `throwOnError` on auth, so nothing hits it yet.
 * @param queryClient - Query client to provide; pass one in to spy on it, or to
 * override the app defaults.
 * @returns Wrapper component providing the QueryClient.
 */
export function createQueryClientWrapper(
  queryClient: QueryClient = makeQueryClient(),
): FunctionComponent<PropsWithChildren> {
  return function QueryClientWrapper({
    children,
  }: PropsWithChildren): ReactNode {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

/** A query client whose invalidations settle only when the suite says so. */
export interface MockQueryClient {
  /** The keys invalidated so far, in call order. */
  invalidatedKeys: () => QueryKey[];
  queryClient: QueryClient;
  /** Settles the invalidation of the given key. */
  resolve: (queryKey: QueryKey) => void;
}

/**
 * Builds a query client whose `invalidateQueries` resolves only when told to,
 * so the width of an awaited invalidation window can be observed.
 *
 * A real `QueryClient` with a spy rather than a hand-built object, so the mock
 * can't drift from the interface the code under test actually calls.
 * @returns the client, the resolver for a named key, and the calls made.
 */
export function mockQueryClient(): MockQueryClient {
  const resolvers = new Map<string, () => void>();
  const invalidated: QueryKey[] = [];
  const queryClient = new QueryClient();
  jest
    .spyOn(queryClient, "invalidateQueries")
    .mockImplementation((filters): Promise<void> => {
      const queryKey = filters?.queryKey ?? [];
      invalidated.push(queryKey);
      const [pending, respond] = promiseWithResolvers<void>();
      resolvers.set(JSON.stringify(queryKey), () => respond());
      return pending;
    });
  return {
    invalidatedKeys: (): QueryKey[] => invalidated,
    queryClient,
    resolve: (queryKey): void => resolvers.get(JSON.stringify(queryKey))?.(),
  };
}
