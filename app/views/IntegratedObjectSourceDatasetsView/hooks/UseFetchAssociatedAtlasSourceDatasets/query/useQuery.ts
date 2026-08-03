import {
  type AtlasId,
  type HCAAtlasTrackerLocalListSourceDataset,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { INTEGRATED_OBJECT_ATLAS_SOURCE_DATASETS } from "./constants";
import { type QueryKey } from "./types";

/**
 * Fetches the atlas's source datasets (the pool available to add to an
 * integrated object) via React Query.
 * @param atlasId - Atlas ID (query key).
 * @param requestUrl - Atlas source datasets request URL.
 * @returns Query result for the atlas source datasets list.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  requestUrl: string,
): UseQueryResult<HCAAtlasTrackerLocalListSourceDataset[], DefaultError> =>
  useAuthedQuery<HCAAtlasTrackerLocalListSourceDataset[], QueryKey>({
    enabled: Boolean(atlasId),
    queryKey: [INTEGRATED_OBJECT_ATLAS_SOURCE_DATASETS, atlasId],
    requestUrl,
    // Refetch on mount to match the previous always-fresh behavior.
    staleTime: 0,
  });
