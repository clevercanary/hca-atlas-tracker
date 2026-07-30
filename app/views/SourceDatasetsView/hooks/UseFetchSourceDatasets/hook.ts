import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerLocalListSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches a source study's source datasets for the given path parameter via
 * React Query. Read-only — no mutation invalidates it.
 * @param pathParameter - Path parameter (atlas ID and source study ID).
 * @returns React Query result for the source datasets list (`data` is the list).
 */
export const useFetchSourceDatasets = (
  pathParameter: PathParameter,
): UseQueryResult<HCAAtlasTrackerLocalListSourceDataset[], DefaultError> => {
  return useQuery(
    pathParameter.atlasId,
    pathParameter.sourceStudyId,
    getRequestURL(API.ATLAS_SOURCE_STUDY_SOURCE_DATASETS, pathParameter),
  );
};
