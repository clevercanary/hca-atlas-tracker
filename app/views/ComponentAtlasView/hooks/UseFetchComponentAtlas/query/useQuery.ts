import {
  AtlasId,
  ComponentAtlasId,
  HCAAtlasTrackerDetailComponentAtlas,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { INTEGRATED_OBJECT } from "./constants";
import { QueryKey } from "./types";

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
): UseQueryResult<HCAAtlasTrackerDetailComponentAtlas, DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<
    HCAAtlasTrackerDetailComponentAtlas,
    DefaultError,
    HCAAtlasTrackerDetailComponentAtlas,
    QueryKey
  >({
    enabled: isAuthenticated && Boolean(atlasId) && Boolean(componentAtlasId),
    queryFn: queryFn<HCAAtlasTrackerDetailComponentAtlas, QueryKey>(
      requestUrl,
      METHOD.GET,
    ),
    queryKey: [INTEGRATED_OBJECT, atlasId, componentAtlasId],
  });
};
