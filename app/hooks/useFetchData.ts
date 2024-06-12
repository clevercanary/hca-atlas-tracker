import { useAsync } from "@databiosphere/findable-ui/lib/hooks/useAsync";
import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback, useEffect } from "react";
import { METHOD } from "../common/entities";
import { getFetchOptions, isFetchStatusOk } from "../common/utils";

interface UseFetchData<D> {
  data?: D;
  isSuccess: boolean;
}

export const useFetchData = <D>(
  requestUrl: string,
  method: METHOD,
  shouldFetch = true
): UseFetchData<D> => {
  const { token } = useAuthentication();
  const { data, isSuccess, run } = useAsync<D>();

  const fetchData = useCallback(async (): Promise<D> => {
    const res = await fetch(requestUrl, getFetchOptions(method, token));
    if (isFetchStatusOk(res.status)) {
      return await res.json();
    }
    throw new Error(
      await res
        .json()
        .then(({ message }) => message)
        .catch(() => `Received ${res.status} response`)
    );
  }, [method, requestUrl, token]);

  useEffect(() => {
    if (!token) return;
    if (!shouldFetch) return;
    run(fetchData());
  }, [fetchData, run, shouldFetch, token]);

  return { data, isSuccess };
};
