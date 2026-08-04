import {
  type AtlasId,
  type HCAAtlasTrackerSourceStudy,
  type SourceStudyId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { SOURCE_STUDY } from "./constants";
import { type QueryKey } from "./types";

/**
 * Fetches a single source study via React Query.
 * @param atlasId - Atlas ID (query key; the fetch is atlas-scoped).
 * @param sourceStudyId - Source study ID (query key).
 * @param requestUrl - Source study request URL.
 * @returns Query result for the source study.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  sourceStudyId: SourceStudyId | undefined,
  requestUrl: string,
): UseQueryResult<HCAAtlasTrackerSourceStudy, DefaultError> =>
  useAuthedQuery<HCAAtlasTrackerSourceStudy, QueryKey>({
    enabled: Boolean(atlasId) && Boolean(sourceStudyId),
    queryKey: [SOURCE_STUDY, atlasId, sourceStudyId],
    requestUrl,
  });
