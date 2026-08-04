import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerUser } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches a user by ID for the given path parameter via React Query. The user
 * edit mutation seeds the cache on success.
 * @param pathParameter - Path parameter (user ID).
 * @returns React Query result for the user (`data` is the user).
 */
export const useFetchUser = (
  pathParameter: PathParameter,
): UseQueryResult<HCAAtlasTrackerUser, DefaultError> => {
  return useQuery(pathParameter.userId, getRequestURL(API.USER, pathParameter));
};
