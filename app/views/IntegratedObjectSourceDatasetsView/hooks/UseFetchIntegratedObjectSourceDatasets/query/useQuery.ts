import {
  AtlasId,
  ComponentAtlasId,
  HCAAtlasTrackerLocalListSourceDataset,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { INTEGRATED_OBJECT_SOURCE_DATASETS } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches an integrated object's source datasets via React Query, mapping each
 * to the view's IntegratedObjectSourceDataset shape.
 * @param atlasId - Atlas ID (query key).
 * @param componentAtlasId - Component atlas ID (query key).
 * @param requestUrl - Integrated object source datasets request URL.
 * @returns Query result for the mapped source datasets list.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  componentAtlasId: ComponentAtlasId | undefined,
  requestUrl: string,
): UseQueryResult<IntegratedObjectSourceDataset[], DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<
    HCAAtlasTrackerLocalListSourceDataset[],
    DefaultError,
    IntegratedObjectSourceDataset[],
    QueryKey
  >({
    enabled: isAuthenticated && Boolean(atlasId) && Boolean(componentAtlasId),
    queryFn: queryFn<HCAAtlasTrackerLocalListSourceDataset[], QueryKey>(
      requestUrl,
      METHOD.GET,
    ),
    queryKey: [INTEGRATED_OBJECT_SOURCE_DATASETS, atlasId, componentAtlasId],
    select: (data) => (atlasId ? mapData(atlasId, data) : []),
    // The list's columns can change out-of-band, so refetch on every mount to
    // match the previous always-fresh behavior; add/remove invalidates the key.
    staleTime: 0,
  });
};

/**
 * Maps HCAAtlasTrackerLocalListSourceDataset[] to IntegratedObjectSourceDataset[].
 * @param atlasId - Atlas ID.
 * @param data - Source datasets.
 * @returns IntegratedObjectSourceDataset[].
 */
function mapData(
  atlasId: AtlasId,
  data: HCAAtlasTrackerLocalListSourceDataset[],
): IntegratedObjectSourceDataset[] {
  return data.map((sourceDataset) => ({
    atlasId,
    ...sourceDataset,
  }));
}
