import {
  AtlasId,
  AtlasStatusSummary,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
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
): UseQueryResult<AtlasStatusSummary, DefaultError> =>
  useAuthedQuery<AtlasStatusSummary, QueryKey>({
    enabled: Boolean(atlasId),
    queryKey: [ATLAS_STATUS, atlasId],
    requestUrl,
    // Status counts change out-of-band (uploads, validations) and nothing
    // invalidates this key, so refetch on mount rather than serve stale counts.
    staleTime: 0,
  });
