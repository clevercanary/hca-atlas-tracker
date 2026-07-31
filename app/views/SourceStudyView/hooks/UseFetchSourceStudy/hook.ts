import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the source study for the given path parameter via React Query.
 * Editing the source study refreshes it by seeding its query key
 * (`[SOURCE_STUDY, atlasId, sourceStudyId]`) at the mutation site.
 * @param pathParameter - Path parameter (atlas ID + source study ID).
 * @returns React Query result for the source study (`data` is the source study).
 */
export const useFetchSourceStudy = (
  pathParameter: PathParameter,
): UseQueryResult<HCAAtlasTrackerSourceStudy, DefaultError> => {
  return useQuery(
    pathParameter.atlasId,
    pathParameter.sourceStudyId,
    getRequestURL(API.ATLAS_SOURCE_STUDY, pathParameter),
  );
};
