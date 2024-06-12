import { API } from "../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerAtlas } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../common/entities";
import { getRequestURL } from "../common/utils";
import { useFetchData } from "./useFetchData";

interface UseFetchAtlas {
  atlas?: HCAAtlasTrackerAtlas;
}

export const useFetchAtlas = (pathParameter: PathParameter): UseFetchAtlas => {
  const { data: atlas } = useFetchData<HCAAtlasTrackerAtlas | undefined>(
    getRequestURL(API.ATLAS, pathParameter),
    METHOD.GET
  );
  return { atlas };
};
