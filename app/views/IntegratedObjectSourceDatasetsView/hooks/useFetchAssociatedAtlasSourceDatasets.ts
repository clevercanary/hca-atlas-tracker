import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerLocalListSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchData } from "@/app/hooks/useFetchData";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { useResetFetchStatus } from "@/app/hooks/useResetFetchStatus";

export const INTEGRATED_OBJECT_ATLAS_SOURCE_DATASETS =
  "integratedObjectAtlasSourceDatasets";

interface UseFetchAssociatedAtlasSourceDatasets {
  atlasSourceDatasets?: HCAAtlasTrackerLocalListSourceDataset[];
}

export const useFetchAssociatedAtlasSourceDatasets = (
  pathParameter: PathParameter,
): UseFetchAssociatedAtlasSourceDatasets => {
  const {
    fetchDataState: { shouldFetchByKey },
  } = useFetchDataState();
  const shouldFetch = shouldFetchByKey[INTEGRATED_OBJECT_ATLAS_SOURCE_DATASETS];

  const { data: atlasSourceDatasets, progress } = useFetchData<
    HCAAtlasTrackerLocalListSourceDataset[] | undefined
  >(
    getRequestURL(API.ATLAS_SOURCE_DATASETS, pathParameter),
    METHOD.GET,
    shouldFetch,
  );

  useResetFetchStatus(progress, [INTEGRATED_OBJECT_ATLAS_SOURCE_DATASETS]);

  return { atlasSourceDatasets };
};
