import { API } from "../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerAtlas } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../common/entities";
import { getRequestURL } from "../common/utils";
import { useFetchData } from "./useFetchData";

interface UseFetchAtlas {
  atlases?: HCAAtlasTrackerAtlas[];
}

export const useFetchAtlases = (): UseFetchAtlas => {
  const { data: atlases } = useFetchData<HCAAtlasTrackerAtlas[] | undefined>(
    getRequestURL(API.ATLASES),
    METHOD.GET,
  );
  return { atlases };
};
