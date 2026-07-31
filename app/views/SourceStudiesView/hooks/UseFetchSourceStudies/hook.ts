import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the atlas's source studies for the given path parameter via React
 * Query. Consumed eagerly by the source studies list view and lazily by the
 * source-study Select (which only mounts when editing); invalidated at source
 * study add/edit/delete mutation sites.
 * @param pathParameter - Path parameter (atlas ID).
 * @returns React Query result for the source studies list (`data` is the list).
 */
export const useFetchSourceStudies = (
  pathParameter: PathParameter,
): UseQueryResult<HCAAtlasTrackerSourceStudy[], DefaultError> => {
  return useQuery(
    pathParameter.atlasId,
    getRequestURL(API.ATLAS_SOURCE_STUDIES, pathParameter),
  );
};
