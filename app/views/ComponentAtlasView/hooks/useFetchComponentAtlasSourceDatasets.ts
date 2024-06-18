import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { useResetFetchStatus } from "../../../hooks/useResetFetchStatus";

interface UseFetchComponentAtlasSourceDatasets {
  componentAtlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const useFetchComponentAtlasSourceDatasets = (
  pathParameter: PathParameter
): UseFetchComponentAtlasSourceDatasets => {
  const {
    fetchDataState: { shouldFetch },
  } = useFetchDataState();
  const { data: componentAtlasSourceDatasets, isSuccess } = useFetchData<
    HCAAtlasTrackerSourceDataset[] | undefined
  >(
    getRequestURL(API.ATLAS_COMPONENT_ATLAS_SOURCE_DATASETS, pathParameter),
    METHOD.GET,
    shouldFetch
  );
  useResetFetchStatus(isSuccess);
  return {
    componentAtlasSourceDatasets,
  };
};
