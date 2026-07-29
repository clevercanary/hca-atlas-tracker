import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchData } from "@/app/hooks/useFetchData";

interface UseFetchSourceStudy {
  sourceStudy?: HCAAtlasTrackerSourceStudy;
}

export const useFetchSourceStudy = (
  pathParameter: PathParameter,
): UseFetchSourceStudy => {
  const { data: sourceStudy } = useFetchData<
    HCAAtlasTrackerSourceStudy | undefined
  >(getRequestURL(API.ATLAS_SOURCE_STUDY, pathParameter), METHOD.GET);
  return { sourceStudy };
};
