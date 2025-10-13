import { API } from "../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerAtlas } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../common/entities";
import { getRequestURL } from "../common/utils";
import { useFetchData } from "./useFetchData";
import { useFetchDataState } from "./useFetchDataState";
import { useResetFetchStatus } from "./useResetFetchStatus";

export const ATLAS = "atlas";

interface UseFetchAtlas {
  atlas?: HCAAtlasTrackerAtlas;
}

export const useFetchAtlas = (pathParameter: PathParameter): UseFetchAtlas => {
  const {
    fetchDataState: { shouldFetchByKey },
  } = useFetchDataState();
  const shouldFetch = shouldFetchByKey[ATLAS];

  const { data: atlas, progress } = useFetchData<
    HCAAtlasTrackerAtlas | undefined
  >(getRequestURL(API.ATLAS, pathParameter), METHOD.GET, shouldFetch);

  useResetFetchStatus(progress, [ATLAS]);

  return { atlas };
};
