import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerDetailComponentAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the component atlas (integrated object) detail for the given path
 * parameter via React Query. Invalidated at integrated-object mutation sites
 * (edit, archive, and source-dataset add/remove).
 * @param pathParameter - Path parameter (atlas ID and component atlas ID).
 * @returns React Query result for the component atlas (`data` is the integrated object).
 */
export const useFetchComponentAtlas = (
  pathParameter: PathParameter,
): UseQueryResult<HCAAtlasTrackerDetailComponentAtlas, DefaultError> => {
  return useQuery(
    pathParameter.atlasId,
    pathParameter.componentAtlasId,
    getRequestURL(API.ATLAS_COMPONENT_ATLAS, pathParameter),
  );
};
