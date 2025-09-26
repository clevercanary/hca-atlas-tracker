import { API } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/api";
import { METHOD } from "../../../../../../../../../../common/entities";
import { getRequestURL } from "../../../../../../../../../../common/utils";
import { useFetchData } from "../../../../../../../../../../hooks/useFetchData";
import { useFetchDataState } from "../../../../../../../../../../hooks/useFetchDataState";
import { useResetFetchStatus } from "../../../../../../../../../../hooks/useResetFetchStatus";

export const useRequestPreSignedURL = (): unknown => {
  const {
    fetchDataState: { shouldFetch },
  } = useFetchDataState();

  const { data, progress } = useFetchData<unknown | undefined>(
    // TODO: update API.
    getRequestURL(API.ATLAS_SOURCE_DATASETS, {
      atlasId: "31b15905-c307-4abf-ab0d-0e177f73ea39", // TODO: update request params.
    }),
    METHOD.GET, // TODO: update to POST.
    shouldFetch
  );

  useResetFetchStatus(progress);

  return { data, progress };
};
