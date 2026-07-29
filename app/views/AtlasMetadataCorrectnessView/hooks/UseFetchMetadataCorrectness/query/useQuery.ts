import {
  AtlasId,
  Heatmap,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { METADATA_CORRECTNESS } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches the atlas metadata-correctness heatmap via React Query.
 * @param atlasId - Atlas ID (query key).
 * @param requestUrl - Metadata-correctness request URL.
 * @returns Query result for the heatmap.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  requestUrl: string,
): UseQueryResult<Heatmap, DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<Heatmap, DefaultError, Heatmap, QueryKey>({
    enabled: isAuthenticated && Boolean(atlasId),
    queryFn: queryFn<Heatmap, QueryKey>(requestUrl, METHOD.GET),
    queryKey: [METADATA_CORRECTNESS, atlasId],
  });
};
