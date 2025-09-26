import { API } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/api";
import { METHOD } from "../../../../../../../../../../common/entities";
import { getRequestURL } from "../../../../../../../../../../common/utils";
import {
  FETCH_PROGRESS,
  useFetchData,
} from "../../../../../../../../../../hooks/useFetchData";
import { useFetchDataState } from "../../../../../../../../../../hooks/useFetchDataState";
import { useResetFetchStatus } from "../../../../../../../../../../hooks/useResetFetchStatus";

interface UseRequestPreSignedURL {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO update useRequestPreSignedURL to return correct type
  data?: any;
  progress: FETCH_PROGRESS;
}

export const useRequestPreSignedURL = (): UseRequestPreSignedURL => {
  const {
    fetchDataState: { shouldFetch },
  } = useFetchDataState();

  const { data, progress } = useFetchData<unknown | undefined>(
    // TODO: update API.
    getRequestURL(API.ATLAS_SOURCE_DATASET, {
      atlasId: "31b15905-c307-4abf-ab0d-0e177f73ea39", // TODO: update request params.
      sourceDatasetId: "23da0598-7c2a-4029-a0a2-764140e5e956", // TODO: update request params.
    }),
    METHOD.GET, // TODO: update to POST.
    shouldFetch
  );

  useResetFetchStatus(progress);

  return { data, progress };
};
