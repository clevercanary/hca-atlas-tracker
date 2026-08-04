import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { getRequestURL } from "@/app/common/utils";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { AUTH_STATUS } from "@databiosphere/findable-ui/lib/auth/types/auth";
import { type UseFetchActiveUser } from "./entities";
import { useQuery } from "./query/useQuery";

export const useFetchActiveUser = (): UseFetchActiveUser => {
  const {
    authState: { isAuthenticated, status },
  } = useAuth();
  const { data: user, isSuccess } = useQuery(
    getRequestURL(API.ACTIVE_USER),
    isAuthenticated,
  );

  const isAuthSettled = status === AUTH_STATUS.SETTLED;

  // The fetch is settled once it has succeeded, or immediately when there is no
  // authenticated user to fetch. `isSuccess` replaces the previous
  // FETCH_PROGRESS.COMPLETED signal.
  const isFetchSettled = !isAuthenticated || isSuccess;

  const isSettled = isAuthSettled && isFetchSettled;

  return { isSettled, user };
};
