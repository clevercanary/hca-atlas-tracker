import {
  AtlasId,
  Heatmap,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
import { METADATA_CORRECTNESS } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches the atlas metadata-correctness heatmap via React Query.
 * @param atlasId - Atlas ID (query key).
 * @param requestUrl - Metadata-correctness request URL.
 * @returns Query result for the heatmap.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  requestUrl: string,
): UseQueryResult<Heatmap, DefaultError> =>
  useAuthedQuery<Heatmap, QueryKey>({
    enabled: Boolean(atlasId),
    queryKey: [METADATA_CORRECTNESS, atlasId],
    requestUrl,
    // Heatmap changes out-of-band (Sync) without invalidating this key, so
    // refetch on mount rather than serve stale results.
    staleTime: 0,
  });
