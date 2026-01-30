import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceStudy } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { useResetFetchStatus } from "../../../hooks/useResetFetchStatus";

export const SOURCE_STUDIES = "sourceStudies";

interface UseFetchSourceStudies {
  sourceStudies?: HCAAtlasTrackerSourceStudy[];
}

export const useFetchSourceStudies = (
  pathParameter: PathParameter,
): UseFetchSourceStudies => {
  const {
    fetchDataState: { shouldFetchByKey },
  } = useFetchDataState();
  const shouldFetch = shouldFetchByKey[SOURCE_STUDIES];

  const { data: sourceStudies, progress } = useFetchData<
    HCAAtlasTrackerSourceStudy[] | undefined
  >(
    getRequestURL(API.ATLAS_SOURCE_STUDIES, pathParameter),
    METHOD.GET,
    shouldFetch,
  );

  useResetFetchStatus(progress, [SOURCE_STUDIES]);

  return { sourceStudies };
};
