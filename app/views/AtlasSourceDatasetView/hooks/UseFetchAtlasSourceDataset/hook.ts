import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerDetailSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the atlas source dataset for the given path parameter via React
 * Query. Editing the source dataset refreshes it by invalidating its query key
 * (`[SOURCE_DATASET, sourceDatasetId]`) at the mutation site.
 * @param pathParameter - Path parameter (source dataset ID).
 * @returns React Query result for the source dataset (`data` is the dataset).
 */
export const useFetchAtlasSourceDataset = (
  pathParameter: PathParameter,
): UseQueryResult<HCAAtlasTrackerDetailSourceDataset, DefaultError> => {
  return useQuery(
    pathParameter.sourceDatasetId,
    getRequestURL(API.ATLAS_SOURCE_DATASET, pathParameter),
  );
};
