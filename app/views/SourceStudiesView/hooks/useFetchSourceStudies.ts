import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchData } from "@/app/hooks/useFetchData";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { useResetFetchStatus } from "@/app/hooks/useResetFetchStatus";

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
