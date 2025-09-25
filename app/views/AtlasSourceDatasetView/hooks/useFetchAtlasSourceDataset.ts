import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerDetailSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";

interface UseFetchAtlasSourceDataset {
  sourceDataset?: HCAAtlasTrackerDetailSourceDataset;
}

export const useFetchAtlasSourceDataset = (
  pathParameter: PathParameter
): UseFetchAtlasSourceDataset => {
  const { data: sourceDataset } = useFetchData<
    HCAAtlasTrackerDetailSourceDataset | undefined
  >(getRequestURL(API.ATLAS_SOURCE_DATASET, pathParameter), METHOD.GET);
  return { sourceDataset };
};
