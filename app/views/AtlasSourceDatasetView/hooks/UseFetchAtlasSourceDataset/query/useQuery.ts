import {
  HCAAtlasTrackerDetailSourceDataset,
  SourceDatasetId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { SOURCE_DATASET } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches a single atlas source dataset via React Query.
 * @param sourceDatasetId - Source dataset ID (query key).
 * @param requestUrl - Source dataset request URL.
 * @returns Query result for the source dataset.
 */
export const useQuery = (
  sourceDatasetId: SourceDatasetId | undefined,
  requestUrl: string,
): UseQueryResult<HCAAtlasTrackerDetailSourceDataset, DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<
    HCAAtlasTrackerDetailSourceDataset,
    DefaultError,
    HCAAtlasTrackerDetailSourceDataset,
    QueryKey
  >({
    enabled: isAuthenticated && Boolean(sourceDatasetId),
    queryFn: queryFn<HCAAtlasTrackerDetailSourceDataset, QueryKey>(
      requestUrl,
      METHOD.GET,
    ),
    queryKey: [SOURCE_DATASET, sourceDatasetId],
  });
};
