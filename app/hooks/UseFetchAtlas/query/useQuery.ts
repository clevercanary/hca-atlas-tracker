import {
  AtlasId,
  HCAAtlasTrackerAtlas,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { ATLAS } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches a single atlas via React Query.
 * @param atlasId - Atlas ID (query key).
 * @param requestUrl - Atlas request URL.
 * @returns Query result for the atlas.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  requestUrl: string,
): UseQueryResult<HCAAtlasTrackerAtlas, DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<
    HCAAtlasTrackerAtlas,
    DefaultError,
    HCAAtlasTrackerAtlas,
    QueryKey
  >({
    enabled: isAuthenticated && Boolean(atlasId),
    queryFn: queryFn<HCAAtlasTrackerAtlas, QueryKey>(requestUrl, METHOD.GET),
    queryKey: [ATLAS, atlasId],
  });
};
