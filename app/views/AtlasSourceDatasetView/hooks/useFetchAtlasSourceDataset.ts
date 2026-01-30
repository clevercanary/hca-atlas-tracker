import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerDetailSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { useResetFetchStatus } from "../../../hooks/useResetFetchStatus";

export const SOURCE_DATASET = "sourceDataset";

interface UseFetchAtlasSourceDataset {
  sourceDataset?: HCAAtlasTrackerDetailSourceDataset;
}

export const useFetchAtlasSourceDataset = (
  pathParameter: PathParameter,
): UseFetchAtlasSourceDataset => {
  const { fetchDataState } = useFetchDataState();
  const { shouldFetchByKey } = fetchDataState;
  const shouldFetch = shouldFetchByKey[SOURCE_DATASET];

  const { data: sourceDataset, progress } = useFetchData<
    HCAAtlasTrackerDetailSourceDataset | undefined
  >(
    getRequestURL(API.ATLAS_SOURCE_DATASET, pathParameter),
    METHOD.GET,
    shouldFetch,
  );

  useResetFetchStatus(progress);

  return { sourceDataset };
};
