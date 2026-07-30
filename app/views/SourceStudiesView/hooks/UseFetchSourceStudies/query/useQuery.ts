import {
  AtlasId,
  HCAAtlasTrackerSourceStudy,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { SOURCE_STUDIES } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches the atlas's source studies via React Query.
 * @param atlasId - Atlas ID (query key).
 * @param requestUrl - Source studies request URL.
 * @returns Query result for the source studies list.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  requestUrl: string,
): UseQueryResult<HCAAtlasTrackerSourceStudy[], DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<
    HCAAtlasTrackerSourceStudy[],
    DefaultError,
    HCAAtlasTrackerSourceStudy[],
    QueryKey
  >({
    enabled: isAuthenticated && Boolean(atlasId),
    queryFn: queryFn<HCAAtlasTrackerSourceStudy[], QueryKey>(
      requestUrl,
      METHOD.GET,
    ),
    queryKey: [SOURCE_STUDIES, atlasId],
    // The list's columns (dataset count, HCA and entry-sheet status) are
    // derived from other entities and change out-of-band, so this query must
    // refetch on every mount to match the pre-React-Query behavior, rather
    // than serving the app-default 5-minute stale window.
    staleTime: 0,
  });
};
