import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerDetailComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";

interface UseFetchComponentAtlas {
  componentAtlas?: HCAAtlasTrackerDetailComponentAtlas;
}

export const useFetchComponentAtlas = (
  pathParameter: PathParameter
): UseFetchComponentAtlas => {
  const { data: componentAtlas } = useFetchData<
    HCAAtlasTrackerDetailComponentAtlas | undefined
  >(getRequestURL(API.ATLAS_COMPONENT_ATLAS, pathParameter), METHOD.GET);

  return {
    componentAtlas,
  };
};
