import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { resetFetchStatus } from "@/app/providers/fetchDataState/actions/resetFetchStatus/dispatch";
import {
  DefaultError,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { ATLAS } from "./query/constants";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the atlas for the given path parameter via React Query.
 *
 * Bridges the legacy fetchDataState refetch triggers (`fetchData([ATLAS])` /
 * `fetchKeys={[ATLAS, …]}`) to React Query cache invalidation, so save/delete
 * flows still refresh the atlas without changing their call sites.
 * @param pathParameter - Path parameter (atlas ID).
 * @returns React Query result for the atlas (`data` is the atlas).
 */
export const useFetchAtlas = (
  pathParameter: PathParameter,
): UseQueryResult<HCAAtlasTrackerAtlas, DefaultError> => {
  const { atlasId } = pathParameter;

  const queryResult = useQuery(
    atlasId,
    getRequestURL(API.ATLAS, pathParameter),
  );

  const {
    fetchDataDispatch,
    fetchDataState: { shouldFetchByKey },
  } = useFetchDataState();

  const shouldRefetch = shouldFetchByKey[ATLAS];
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!shouldRefetch) return;
    queryClient.invalidateQueries({ queryKey: [ATLAS] });
    fetchDataDispatch(resetFetchStatus([ATLAS]));
  }, [fetchDataDispatch, queryClient, shouldRefetch]);

  return queryResult;
};
