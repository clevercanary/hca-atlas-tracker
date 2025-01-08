import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";

interface UseFetchAtlasSourceDatasets {
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const useFetchAtlasSourceDatasets = (
  pathParameter: PathParameter
): UseFetchAtlasSourceDatasets => {
  const { data: atlasSourceDatasets } = useFetchData<
    HCAAtlasTrackerSourceDataset[] | undefined
  >(getRequestURL(API.ATLAS_SOURCE_DATASETS, pathParameter), METHOD.GET);
  return { atlasSourceDatasets };
};
