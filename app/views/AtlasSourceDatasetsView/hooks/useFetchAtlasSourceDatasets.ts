import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { useResetFetchStatus } from "../../../hooks/useResetFetchStatus";

interface UseFetchAtlasSourceDatasets {
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const useFetchAtlasSourceDatasets = (
  pathParameter: PathParameter
): UseFetchAtlasSourceDatasets => {
  const {
    fetchDataState: { shouldFetch },
  } = useFetchDataState();
  const { data: atlasSourceDatasets, isSuccess } = useFetchData<
    HCAAtlasTrackerSourceDataset[] | undefined
  >(
    getRequestURL(API.ATLAS_SOURCE_DATASETS, pathParameter),
    METHOD.GET,
    shouldFetch
  );
  useResetFetchStatus(isSuccess);
  return { atlasSourceDatasets };
};
