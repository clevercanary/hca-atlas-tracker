import { HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
import { ATLASES } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches the full list of atlases via React Query.
 * @param requestUrl - Atlases request URL.
 * @returns Query result for the atlases list.
 */
export const useQuery = (
  requestUrl: string,
): UseQueryResult<HCAAtlasTrackerAtlas[], DefaultError> =>
  useAuthedQuery<HCAAtlasTrackerAtlas[], QueryKey>({
    queryKey: [ATLASES],
    requestUrl,
    // Refetch on mount to match the previous always-fresh behavior.
    staleTime: 0,
  });
