import {
  AtlasId,
  HCAAtlasTrackerLocalListSourceDataset,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { INTEGRATED_OBJECT_ATLAS_SOURCE_DATASETS } from "./constants";
import { QueryKey } from "./types";

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
): UseQueryResult<HCAAtlasTrackerLocalListSourceDataset[], DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<
    HCAAtlasTrackerLocalListSourceDataset[],
    DefaultError,
    HCAAtlasTrackerLocalListSourceDataset[],
    QueryKey
  >({
    enabled: isAuthenticated && Boolean(atlasId),
    queryFn: queryFn<HCAAtlasTrackerLocalListSourceDataset[], QueryKey>(
      requestUrl,
      METHOD.GET,
    ),
    queryKey: [INTEGRATED_OBJECT_ATLAS_SOURCE_DATASETS, atlasId],
    // Refetch on mount to match the previous always-fresh behavior.
    staleTime: 0,
  });
};
