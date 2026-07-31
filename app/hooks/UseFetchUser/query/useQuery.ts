import {
  HCAAtlasTrackerUser,
  UserId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
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
): UseQueryResult<HCAAtlasTrackerUser, DefaultError> =>
  useAuthedQuery<HCAAtlasTrackerUser, QueryKey>({
    enabled: userId !== undefined,
    queryKey: [USER, userId],
    requestUrl,
  });
