import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { Heatmap } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the atlas metadata-correctness heatmap for the given path parameter
 * via React Query. Read-only — no mutation invalidates it.
 * @param pathParameter - Path parameter (atlas ID).
 * @returns React Query result for the heatmap (`data` is the heatmap).
 */
export const useFetchMetadataCorrectness = (
  pathParameter: PathParameter,
): UseQueryResult<Heatmap, DefaultError> => {
  return useQuery(
    pathParameter.atlasId,
    getRequestURL(API.ATLAS_METADATA_CORRECTNESS, pathParameter),
  );
};
