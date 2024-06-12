import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceStudy } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";

interface UseFetchSourceStudies {
  sourceStudies?: HCAAtlasTrackerSourceStudy[];
}

export const useFetchSourceStudies = (
  pathParameter: PathParameter
): UseFetchSourceStudies => {
  const { data: sourceStudies } = useFetchData<
    HCAAtlasTrackerSourceStudy[] | undefined
  >(getRequestURL(API.ATLAS_SOURCE_STUDIES, pathParameter), METHOD.GET);

  return { sourceStudies };
};
