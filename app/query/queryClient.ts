import { QueryClient } from "@tanstack/react-query";

/**
 * Default React Query options for the app's QueryClient. A non-zero `staleTime`
 * keeps recently-fetched resources warm so tab switches and back-navigation
 * render from cache instead of re-fetching; mutations invalidate the relevant
 * query keys to refresh.
 */
export const DEFAULT_QUERY_OPTIONS = {
  queries: {
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes.
  },
} as const;

/**
 * Creates a QueryClient configured with the app defaults.
 * @returns QueryClient.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: DEFAULT_QUERY_OPTIONS });
}
