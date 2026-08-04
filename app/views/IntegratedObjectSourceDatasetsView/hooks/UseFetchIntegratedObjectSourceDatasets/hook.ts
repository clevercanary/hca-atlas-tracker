import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { type IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches an integrated object's source datasets for the given path parameter
 * via React Query. Invalidated at the add/remove mutation sites.
 * @param pathParameter - Path parameter (atlas ID and component atlas ID).
 * @returns React Query result for the source datasets list (`data` is the mapped list).
 */
export const useFetchIntegratedObjectSourceDatasets = (
  pathParameter: PathParameter,
): UseQueryResult<IntegratedObjectSourceDataset[], DefaultError> => {
  return useQuery(
    pathParameter.atlasId,
    pathParameter.componentAtlasId,
    getRequestURL(API.ATLAS_COMPONENT_ATLAS_SOURCE_DATASETS, pathParameter),
  );
};
