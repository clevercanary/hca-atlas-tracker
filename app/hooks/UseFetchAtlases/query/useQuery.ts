import { HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { ATLASES } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches the full list of atlases via React Query.
 * @param requestUrl - Atlases request URL.
 * @returns Query result for the atlases list.
 */
export const useQuery = (
  requestUrl: string,
): UseQueryResult<HCAAtlasTrackerAtlas[], DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<
    HCAAtlasTrackerAtlas[],
    DefaultError,
    HCAAtlasTrackerAtlas[],
    QueryKey
  >({
    enabled: isAuthenticated,
    queryFn: queryFn<HCAAtlasTrackerAtlas[], QueryKey>(requestUrl, METHOD.GET),
    queryKey: [ATLASES],
    // Refetch on mount to match the previous always-fresh behavior.
    staleTime: 0,
  });
};
