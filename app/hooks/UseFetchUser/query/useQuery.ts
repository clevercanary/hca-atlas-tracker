import {
  HCAAtlasTrackerUser,
  UserId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { USER } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches a user by ID via React Query.
 * @param userId - User ID (query key).
 * @param requestUrl - User request URL.
 * @returns Query result for the user.
 */
export const useQuery = (
  userId: UserId | undefined,
  requestUrl: string,
): UseQueryResult<HCAAtlasTrackerUser, DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<
    HCAAtlasTrackerUser,
    DefaultError,
    HCAAtlasTrackerUser,
    QueryKey
  >({
    enabled: isAuthenticated && userId !== undefined,
    queryFn: queryFn<HCAAtlasTrackerUser, QueryKey>(requestUrl, METHOD.GET),
    queryKey: [USER, userId],
  });
};
