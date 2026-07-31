import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { AtlasStatusSummary } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the atlas status summary for the given path parameter via React
 * Query. Read-only — no mutation invalidates it.
 * @param pathParameter - Path parameter (atlas ID).
 * @returns React Query result for the atlas status summary (`data` is the summary).
 */
export const useFetchAtlasStatus = (
  pathParameter: PathParameter,
): UseQueryResult<AtlasStatusSummary, DefaultError> => {
  return useQuery(
    pathParameter.atlasId,
    getRequestURL(API.ATLAS_STATUS, pathParameter),
  );
};
