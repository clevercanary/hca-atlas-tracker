import {
  AtlasId,
  HCAAtlasTrackerLocalListSourceDataset,
  SourceStudyId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
import { SOURCE_STUDY_SOURCE_DATASETS } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches a source study's source datasets via React Query.
 * @param atlasId - Atlas ID (query key).
 * @param sourceStudyId - Source study ID (query key).
 * @param requestUrl - Source study source datasets request URL.
 * @returns Query result for the source datasets list.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  sourceStudyId: SourceStudyId | undefined,
  requestUrl: string,
): UseQueryResult<HCAAtlasTrackerLocalListSourceDataset[], DefaultError> =>
  useAuthedQuery<HCAAtlasTrackerLocalListSourceDataset[], QueryKey>({
    enabled: Boolean(atlasId) && Boolean(sourceStudyId),
    queryKey: [SOURCE_STUDY_SOURCE_DATASETS, atlasId, sourceStudyId],
    requestUrl,
    // The list's columns can change out-of-band, so refetch on every mount to
    // match the previous always-fresh (global shouldFetch) behavior.
    staleTime: 0,
  });
