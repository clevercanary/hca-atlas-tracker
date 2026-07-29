import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerLocalListSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchData } from "@/app/hooks/useFetchData";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { useResetFetchStatus } from "@/app/hooks/useResetFetchStatus";
import { useMemo } from "react";
import { IntegratedObjectSourceDataset } from "../entities";

export const INTEGRATED_OBJECT_SOURCE_DATASETS =
  "integratedObjectSourceDatasets";

interface UseFetchIntegratedObjectSourceDatasets {
  integratedObjectSourceDatasets?: IntegratedObjectSourceDataset[];
}

export const useFetchIntegratedObjectSourceDatasets = (
  pathParameter: PathParameter,
): UseFetchIntegratedObjectSourceDatasets => {
  const {
    fetchDataState: { shouldFetchByKey },
  } = useFetchDataState();
  const shouldFetch = shouldFetchByKey[INTEGRATED_OBJECT_SOURCE_DATASETS];

  // Validate atlasId - required for API request.
  if (!pathParameter.atlasId) throw new Error("Atlas ID is required");

  const { data, progress } = useFetchData<
    HCAAtlasTrackerLocalListSourceDataset[] | undefined
  >(
    getRequestURL(API.ATLAS_COMPONENT_ATLAS_SOURCE_DATASETS, pathParameter),
    METHOD.GET,
    shouldFetch,
  );

  useResetFetchStatus(progress, [INTEGRATED_OBJECT_SOURCE_DATASETS]);

  // Extract atlasId from pathParameter.
  const { atlasId } = pathParameter;

  const integratedObjectSourceDatasets = useMemo(
    () => mapData(atlasId, data),
    [atlasId, data],
  );

  return { integratedObjectSourceDatasets };
};

/**
 * Map HCAAtlasTrackerSourceDataset[] to IntegratedObjectSourceDataset[].
 * @param atlasId - Atlas ID.
 * @param data - Atlas source datasets.
 * @returns IntegratedObjectSourceDataset[].
 */
function mapData(
  atlasId: string,
  data: HCAAtlasTrackerLocalListSourceDataset[] = [],
): IntegratedObjectSourceDataset[] {
  return data.map((sourceDataset) => ({
    atlasId,
    ...sourceDataset,
  }));
}
