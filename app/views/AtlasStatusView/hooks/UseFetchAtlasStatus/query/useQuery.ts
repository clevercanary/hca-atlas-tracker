import {
  AtlasId,
  AtlasStatusSummary,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { ATLAS_STATUS } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches the atlas status summary via React Query.
 * @param atlasId - Atlas ID (query key).
 * @param requestUrl - Atlas status request URL.
 * @returns Query result for the atlas status summary.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  requestUrl: string,
): UseQueryResult<AtlasStatusSummary, DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();
  return useReactQuery<
    AtlasStatusSummary,
    DefaultError,
    AtlasStatusSummary,
    QueryKey
  >({
    enabled: isAuthenticated && Boolean(atlasId),
    queryFn: queryFn<AtlasStatusSummary, QueryKey>(requestUrl, METHOD.GET),
    queryKey: [ATLAS_STATUS, atlasId],
    // Status counts change out-of-band (uploads, validations) and nothing
    // invalidates this key, so refetch on mount rather than serve stale counts.
    staleTime: 0,
  });
};
