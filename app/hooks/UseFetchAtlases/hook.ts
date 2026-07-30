import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the full list of atlases via React Query. Read-only — no mutation
 * invalidates it.
 * @returns React Query result for the atlases list (`data` is the list).
 */
export const useFetchAtlases = (): UseQueryResult<
  HCAAtlasTrackerAtlas[],
  DefaultError
> => {
  return useQuery(getRequestURL(API.ATLASES));
};
