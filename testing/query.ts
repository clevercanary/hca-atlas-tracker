import { makeQueryClient } from "@/app/query/queryClient";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
