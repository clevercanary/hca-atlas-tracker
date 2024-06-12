import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";

interface UseFetchComponentAtlases {
  componentAtlases?: HCAAtlasTrackerComponentAtlas[];
}

export const useFetchComponentAtlases = (
  pathParameter: PathParameter
): UseFetchComponentAtlases => {
  const { data: componentAtlases } = useFetchData<
    HCAAtlasTrackerComponentAtlas[] | undefined
  >(getRequestURL(API.ATLAS_COMPONENT_ATLASES, pathParameter), METHOD.GET);

  return { componentAtlases };
};
