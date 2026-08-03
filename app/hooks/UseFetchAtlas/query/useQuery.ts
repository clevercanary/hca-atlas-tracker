import {
  type AtlasId,
  type HCAAtlasTrackerAtlas,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { ATLAS } from "./constants";
import { type QueryKey } from "./types";

/**
 * Fetches a single atlas via React Query.
 * @param atlasId - Atlas ID (query key).
 * @param requestUrl - Atlas request URL.
 * @returns Query result for the atlas.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  requestUrl: string,
): UseQueryResult<HCAAtlasTrackerAtlas, DefaultError> =>
  useAuthedQuery<HCAAtlasTrackerAtlas, QueryKey>({
    enabled: Boolean(atlasId),
    queryKey: [ATLAS, atlasId],
    requestUrl,
  });
