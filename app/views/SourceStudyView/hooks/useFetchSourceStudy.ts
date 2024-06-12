import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceStudy } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";

interface UseFetchSourceStudy {
  sourceStudy?: HCAAtlasTrackerSourceStudy;
}

export const useFetchSourceStudy = (
  pathParameter: PathParameter
): UseFetchSourceStudy => {
  const { data: sourceStudy } = useFetchData<
    HCAAtlasTrackerSourceStudy | undefined
  >(getRequestURL(API.ATLAS_SOURCE_STUDY, pathParameter), METHOD.GET);
  return { sourceStudy };
};
