import { useAuth } from "@databiosphere/findable-ui/lib/providers/authentication/auth/hook";
import { useCallback, useEffect, useState } from "react";
import { METHOD } from "../common/entities";
import { fetchResource, isFetchStatusOk } from "../common/utils";

enum FETCH_OUTCOME {
  ERROR = "ERROR",
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
}

type FetchState<D> =
  | { outcome: FETCH_OUTCOME.PENDING }
  | { data: D; outcome: FETCH_OUTCOME.SUCCESS }
  | { error: unknown; outcome: FETCH_OUTCOME.ERROR };

const PENDING_STATE = { outcome: FETCH_OUTCOME.PENDING } as const;

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

  const [state, setState] = useState<FetchState<D>>(PENDING_STATE);

  if (state.outcome === FETCH_OUTCOME.ERROR) throw state.error;

  const fetchData = useCallback(
    async (abortSignal: AbortSignal): Promise<D> => {
      const res = await fetchResource(requestUrl, method, undefined, {
        signal: abortSignal,
      });
      if (isFetchStatusOk(res.status)) {
        return await res.json();
      }
      throw new Error(
        await res
          .json()
          .then(({ message }) => message)
          .catch(() => `Received ${res.status} response`)
      );
    },
    [method, requestUrl]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setState(PENDING_STATE);
      return;
    }

    if (!shouldFetch) return;

    const abortController = new AbortController();

    fetchData(abortController.signal)
      .then((data) => setState({ data, outcome: FETCH_OUTCOME.SUCCESS }))
      .catch((error) => {
        if (abortController.signal.aborted) return;
        setState({ error, outcome: FETCH_OUTCOME.ERROR });
      });

    return (): void => {
      abortController.abort();
    };
  }, [fetchData, isAuthenticated, shouldFetch]);

  return state.outcome === FETCH_OUTCOME.SUCCESS
    ? { data: state.data, isSuccess: true }
    : { data: undefined, isSuccess: false };
};
