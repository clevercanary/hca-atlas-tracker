import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerDetailSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchData } from "@/app/hooks/useFetchData";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { useResetFetchStatus } from "@/app/hooks/useResetFetchStatus";

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
