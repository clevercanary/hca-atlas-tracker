import {
  type AtlasId,
  type HCAAtlasTrackerDetailSourceDataset,
  type SourceDatasetId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { SOURCE_DATASET } from "./constants";
import { type QueryKey } from "./types";

/**
 * Fetches a single atlas source dataset via React Query.
 * @param atlasId - Atlas ID (query key; the fetch is atlas-scoped).
 * @param sourceDatasetId - Source dataset ID (query key).
 * @param requestUrl - Source dataset request URL.
 * @returns Query result for the source dataset.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  sourceDatasetId: SourceDatasetId | undefined,
  requestUrl: string,
): UseQueryResult<HCAAtlasTrackerDetailSourceDataset, DefaultError> =>
  useAuthedQuery<HCAAtlasTrackerDetailSourceDataset, QueryKey>({
    enabled: Boolean(atlasId) && Boolean(sourceDatasetId),
    queryKey: [SOURCE_DATASET, atlasId, sourceDatasetId],
    requestUrl,
  });
