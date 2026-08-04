import {
  type AtlasId,
  type ComponentAtlasId,
  type HCAAtlasTrackerDetailComponentAtlas,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { INTEGRATED_OBJECT } from "./constants";
import { type QueryKey } from "./types";

/**
 * Fetches the component atlas (integrated object) detail via React Query.
 * @param atlasId - Atlas ID (query key).
 * @param componentAtlasId - Component atlas ID (query key).
 * @param requestUrl - Component atlas request URL.
 * @returns Query result for the component atlas.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  componentAtlasId: ComponentAtlasId | undefined,
  requestUrl: string,
): UseQueryResult<HCAAtlasTrackerDetailComponentAtlas, DefaultError> =>
  useAuthedQuery<HCAAtlasTrackerDetailComponentAtlas, QueryKey>({
    enabled: Boolean(atlasId) && Boolean(componentAtlasId),
    queryKey: [INTEGRATED_OBJECT, atlasId, componentAtlasId],
    requestUrl,
  });
