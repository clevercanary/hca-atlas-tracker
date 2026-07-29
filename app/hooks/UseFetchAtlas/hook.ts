import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the atlas for the given path parameter via React Query. Mutations
 * that affect the atlas (e.g. publishing it, archiving/unarchiving its files)
 * refresh it by invalidating its query key (`[ATLAS, atlasId]`) at the mutation
 * site.
 * @param pathParameter - Path parameter (atlas ID).
 * @returns React Query result for the atlas (`data` is the atlas).
 */
export const useFetchAtlas = (
  pathParameter: PathParameter,
): UseQueryResult<HCAAtlasTrackerAtlas, DefaultError> => {
  return useQuery(
    pathParameter.atlasId,
    getRequestURL(API.ATLAS, pathParameter),
  );
};
