import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { useResetFetchStatus } from "../../../hooks/useResetFetchStatus";

export const INTEGRATED_OBJECT_SOURCE_DATASETS =
  "integratedObjectSourceDatasets";

interface UseFetchComponentAtlasSourceDatasets {
  componentAtlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const useFetchComponentAtlasSourceDatasets = (
  pathParameter: PathParameter
): UseFetchComponentAtlasSourceDatasets => {
  const {
    fetchDataState: { shouldFetchByKey },
  } = useFetchDataState();
  const shouldFetch = shouldFetchByKey[INTEGRATED_OBJECT_SOURCE_DATASETS];

  const { data: componentAtlasSourceDatasets, progress } = useFetchData<
    HCAAtlasTrackerSourceDataset[] | undefined
  >(
    getRequestURL(API.ATLAS_COMPONENT_ATLAS_SOURCE_DATASETS, pathParameter),
    METHOD.GET,
    shouldFetch
  );

  useResetFetchStatus(progress, INTEGRATED_OBJECT_SOURCE_DATASETS);

  return { componentAtlasSourceDatasets };
};
