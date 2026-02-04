import { API } from "../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerUser } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../common/entities";
import { getRequestURL } from "../common/utils";
import { useFetchData } from "./useFetchData";

interface UseFetchUser {
  user?: HCAAtlasTrackerUser;
}

export const useFetchUser = (pathParameter: PathParameter): UseFetchUser => {
  const { data: user } = useFetchData<HCAAtlasTrackerUser | undefined>(
    getRequestURL(API.USER, pathParameter),
    METHOD.GET,
  );
  return { user };
};
