import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerDetailSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the atlas source dataset for the given path parameter via React
 * Query. Mutation sites refresh it through its query key (`[SOURCE_DATASET,
 * atlasId, sourceDatasetId]`): editing writes the PATCH response straight into
 * the cache with `setQueryData`, while archiving invalidates the key to refetch.
 * @param pathParameter - Path parameter (atlas ID + source dataset ID).
 * @returns React Query result for the source dataset (`data` is the dataset).
 */
export const useFetchAtlasSourceDataset = (
  pathParameter: PathParameter,
): UseQueryResult<HCAAtlasTrackerDetailSourceDataset, DefaultError> => {
  return useQuery(
    pathParameter.atlasId,
    pathParameter.sourceDatasetId,
    getRequestURL(API.ATLAS_SOURCE_DATASET, pathParameter),
  );
};
