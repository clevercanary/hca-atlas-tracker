import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerDetailComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { useResetFetchStatus } from "../../../hooks/useResetFetchStatus";

export const INTEGRATED_OBJECT = "integratedObject";

interface UseFetchComponentAtlas {
  componentAtlas?: HCAAtlasTrackerDetailComponentAtlas;
}

export const useFetchComponentAtlas = (
  pathParameter: PathParameter
): UseFetchComponentAtlas => {
  const { fetchDataState } = useFetchDataState();
  const { shouldFetchByKey } = fetchDataState;
  const shouldFetch = shouldFetchByKey[INTEGRATED_OBJECT];

  const { data: componentAtlas, progress } = useFetchData<
    HCAAtlasTrackerDetailComponentAtlas | undefined
  >(
    getRequestURL(API.ATLAS_COMPONENT_ATLAS, pathParameter),
    METHOD.GET,
    shouldFetch
  );

  useResetFetchStatus(progress, [INTEGRATED_OBJECT]);

  return { componentAtlas };
};
