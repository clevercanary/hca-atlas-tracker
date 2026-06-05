import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerLocalListSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { useResetFetchStatus } from "../../../hooks/useResetFetchStatus";

interface UseFetchSourceDatasets {
  sourceDatasets?: HCAAtlasTrackerLocalListSourceDataset[];
}

export const useFetchSourceDatasets = (
  pathParameter: PathParameter,
): UseFetchSourceDatasets => {
  const {
    fetchDataState: { shouldFetch },
  } = useFetchDataState();
  const { data: sourceDatasets, progress } = useFetchData<
    HCAAtlasTrackerLocalListSourceDataset[] | undefined
  >(
    getRequestURL(API.ATLAS_SOURCE_STUDY_SOURCE_DATASETS, pathParameter),
    METHOD.GET,
    shouldFetch,
  );
  useResetFetchStatus(progress);
  return { sourceDatasets };
};
