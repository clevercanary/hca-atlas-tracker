import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerLocalListSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the atlas's source datasets (the pool available to add to an
 * integrated object) for the given path parameter via React Query. Read-only —
 * no mutation invalidates it.
 * @param pathParameter - Path parameter (atlas ID).
 * @returns React Query result for the atlas source datasets list (`data` is the list).
 */
export const useFetchAssociatedAtlasSourceDatasets = (
  pathParameter: PathParameter,
): UseQueryResult<HCAAtlasTrackerLocalListSourceDataset[], DefaultError> => {
  return useQuery(
    pathParameter.atlasId,
    getRequestURL(API.ATLAS_SOURCE_DATASETS, pathParameter),
  );
};
