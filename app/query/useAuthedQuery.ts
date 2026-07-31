import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  QueryKey,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";

export interface AuthedQueryOptions<TData, TView, TQueryKey extends QueryKey> {
  enabled?: boolean;
  method?: METHOD;
  queryKey: TQueryKey;
  requestUrl: string;
  select?: (data: TData) => TView;
  staleTime?: number;
}

/**
 * Auth-gated React Query wrapper shared by the entity fetch hooks. Adds the
 * `isAuthenticated` gate once (so it can't be omitted per hook — the failure
 * mode behind the review's staleness findings), gates `throwOnError` on auth so
 * a logged-out render never re-throws a cached error, and wires the generic
 * `queryFn`. Callers pass the query key, request URL, and any per-hook options: an extra
 * `enabled` gate beyond authentication, the HTTP `method`, a `select` mapper,
 * and a `staleTime` override.
 * @param options - Query options.
 * @param options.enabled - Extra enablement gate ANDed with authentication (default true).
 * @param options.method - HTTP method (default GET).
 * @param options.queryKey - Query key.
 * @param options.requestUrl - Request URL.
 * @param options.select - Optional selector mapping the response to the view shape.
 * @param options.staleTime - Optional staleTime override (defaults to the query client default).
 * @returns React Query result.
 */
export const useAuthedQuery = <
  TData,
  TQueryKey extends QueryKey = QueryKey,
  TView = TData,
>({
  enabled = true,
  method = METHOD.GET,
  queryKey,
  requestUrl,
  select,
  staleTime,
}: AuthedQueryOptions<TData, TView, TQueryKey>): UseQueryResult<
  TView,
  DefaultError
> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<TData, DefaultError, TView, TQueryKey>({
    enabled: isAuthenticated && enabled,
    queryFn: queryFn<TData, TQueryKey>(requestUrl, method),
    queryKey,
    select,
    staleTime,
    // Gate throwOnError on auth (not just `enabled`): `enabled: false` stops
    // fetching but a previously-cached error would still re-throw to a
    // logged-out user during the logout render, before AuthorizationProvider's
    // cache-clear effect runs. While authenticated it still throws, surfacing
    // failures to the app ErrorBoundary (mirrors useFetchActiveUser).
    throwOnError: isAuthenticated,
  });
};
