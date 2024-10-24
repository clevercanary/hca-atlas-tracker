import { useAsync } from "@databiosphere/findable-ui/lib/hooks/useAsync";
import { useAuth } from "@databiosphere/findable-ui/lib/providers/authentication/auth/hook";
import { useCallback, useEffect } from "react";
import { METHOD } from "../common/entities";
import { fetchResource, isFetchStatusOk } from "../common/utils";

interface UseFetchData<D> {
  data?: D;
  isSuccess: boolean;
}

export const useFetchData = <D>(
  requestUrl: string,
  method: METHOD,
  shouldFetch = true
): UseFetchData<D> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();
  const { data, isSuccess, run } = useAsync<D>();

  const fetchData = useCallback(async (): Promise<D> => {
    const res = await fetchResource(requestUrl, method);
    if (isFetchStatusOk(res.status)) {
      return await res.json();
    }
    throw new Error(
      await res
        .json()
        .then(({ message }) => message)
        .catch(() => `Received ${res.status} response`)
    );
  }, [method, requestUrl]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!shouldFetch) return;
    run(fetchData());
  }, [fetchData, run, isAuthenticated, shouldFetch]);

  return { data, isSuccess };
};
