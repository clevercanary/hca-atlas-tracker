import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerDetailComponentAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchData } from "@/app/hooks/useFetchData";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { useResetFetchStatus } from "@/app/hooks/useResetFetchStatus";

export const INTEGRATED_OBJECT = "integratedObject";

interface UseFetchComponentAtlas {
  componentAtlas?: HCAAtlasTrackerDetailComponentAtlas;
}

export const useFetchComponentAtlas = (
  pathParameter: PathParameter,
): UseFetchComponentAtlas => {
  const { fetchDataState } = useFetchDataState();
  const { shouldFetchByKey } = fetchDataState;
  const shouldFetch = shouldFetchByKey[INTEGRATED_OBJECT];

  const { data: componentAtlas, progress } = useFetchData<
    HCAAtlasTrackerDetailComponentAtlas | undefined
  >(
    getRequestURL(API.ATLAS_COMPONENT_ATLAS, pathParameter),
    METHOD.GET,
    shouldFetch,
  );

  useResetFetchStatus(progress, [INTEGRATED_OBJECT]);

  return { componentAtlas };
};
