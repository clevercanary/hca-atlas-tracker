import { API } from "../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerActiveUser } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../common/entities";
import { useFetchData } from "./useFetchData";

export const useFetchUser = (): HCAAtlasTrackerActiveUser | undefined => {
  const { data: user } = useFetchData<HCAAtlasTrackerActiveUser | undefined>(
    API.USER,
    METHOD.GET
  );

  return user;
};
