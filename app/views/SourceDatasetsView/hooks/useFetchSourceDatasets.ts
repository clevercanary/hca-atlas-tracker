import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerLocalListSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchData } from "@/app/hooks/useFetchData";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { useResetFetchStatus } from "@/app/hooks/useResetFetchStatus";

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
