import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { useResetFetchStatus } from "../../../hooks/useResetFetchStatus";

export const INTEGRATED_OBJECT_ATLAS_SOURCE_DATASETS =
  "integratedObjectAtlasSourceDatasets";

interface UseFetchAssociatedAtlasSourceDatasets {
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const useFetchAssociatedAtlasSourceDatasets = (
  pathParameter: PathParameter,
): UseFetchAssociatedAtlasSourceDatasets => {
  const {
    fetchDataState: { shouldFetchByKey },
  } = useFetchDataState();
  const shouldFetch = shouldFetchByKey[INTEGRATED_OBJECT_ATLAS_SOURCE_DATASETS];

  const { data: atlasSourceDatasets, progress } = useFetchData<
    HCAAtlasTrackerSourceDataset[] | undefined
  >(
    getRequestURL(API.ATLAS_SOURCE_DATASETS, pathParameter),
    METHOD.GET,
    shouldFetch,
  );

  useResetFetchStatus(progress, [INTEGRATED_OBJECT_ATLAS_SOURCE_DATASETS]);

  return { atlasSourceDatasets };
};
