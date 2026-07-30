import { HCAAtlasTrackerActiveUser } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { ACTIVE_USER } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches (and, on first login, upserts) the active user via React Query. The
 * `/api/me` endpoint is a PUT that registers the user if absent.
 *
 * `staleTime: Infinity` because the active user is session-stable — a role
 * change surfaces on next login or a full reload, matching the previous
 * fetch-once behavior. The `[ACTIVE_USER]` key is session-scoped (it carries no
 * user id), so cross-user isolation relies on AuthorizationProvider clearing
 * the React Query cache on logout.
 *
 * `throwOnError` is gated on `isAuthenticated` rather than the global default
 * (true), so a stale error is not re-thrown to a logged-out user during the
 * logout render (the cache is cleared in an effect, which runs after render) —
 * mirroring the previous useFetchData reset-on-logout behavior. While
 * authenticated it still throws, matching the prior behavior (that throw
 * escapes the ErrorBoundary nested below AuthorizationProvider).
 * @param requestUrl - Active user request URL.
 * @param isAuthenticated - Whether a user is authenticated (gates fetch + throw).
 * @returns Query result for the active user.
 */
export const useQuery = (
  requestUrl: string,
  isAuthenticated: boolean,
): UseQueryResult<HCAAtlasTrackerActiveUser, DefaultError> => {
  return useReactQuery<
    HCAAtlasTrackerActiveUser,
    DefaultError,
    HCAAtlasTrackerActiveUser,
    QueryKey
  >({
    enabled: isAuthenticated,
    queryFn: queryFn<HCAAtlasTrackerActiveUser, QueryKey>(
      requestUrl,
      METHOD.PUT,
    ),
    queryKey: [ACTIVE_USER],
    staleTime: Infinity,
    throwOnError: isAuthenticated,
  });
};
