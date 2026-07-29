import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerActiveUser } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { AUTH_STATUS } from "@databiosphere/findable-ui/lib/auth/types/auth";
import { FETCH_PROGRESS, useFetchData } from "../useFetchData";
import { UseFetchActiveUser } from "./entities";

export const useFetchActiveUser = (): UseFetchActiveUser => {
  const {
    authState: { isAuthenticated, status },
  } = useAuth();
  const { data: user, progress } = useFetchData<
    HCAAtlasTrackerActiveUser | undefined
  >(API.ACTIVE_USER, METHOD.PUT);

  const isAuthSettled = status === AUTH_STATUS.SETTLED;

  const isFetchSettled =
    !isAuthenticated || progress === FETCH_PROGRESS.COMPLETED;

  const isSettled = isAuthSettled && isFetchSettled;

  return { isSettled, user };
};
