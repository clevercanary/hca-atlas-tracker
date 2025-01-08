import { useAuth } from "@databiosphere/findable-ui/lib/providers/authentication/auth/hook";
import { useCallback, useEffect, useReducer, useState } from "react";
import { METHOD } from "../common/entities";
import { fetchResource, isFetchStatusOk } from "../common/utils";

export enum FETCH_PROGRESS {
  COMPLETED = "COMPLETED",
  FETCHING = "FETCHING",
  INACTIVE = "INACTIVE",
}

enum FetchProgressActionKind {
  Completed = "COMPLETED",
  Fetching = "FETCHING",
  NotFetching = "NOT_FETCHING",
}

enum FETCH_OUTCOME {
  ERROR = "ERROR",
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
}

/**
 * Valid fetch states: pending, successful with data, or failed with error.
 */
type FetchState<D> =
  | { outcome: FETCH_OUTCOME.PENDING }
  | { data: D; outcome: FETCH_OUTCOME.SUCCESS }
  | { error: unknown; outcome: FETCH_OUTCOME.ERROR };

const PENDING_STATE = { outcome: FETCH_OUTCOME.PENDING } as const;

interface UseFetchData<D> {
  data?: D;
  isSuccess: boolean;
  progress: FETCH_PROGRESS;
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

  const [progress, progressDispatch] = useReducer(
    fetchProgressReducer,
    FETCH_PROGRESS.INACTIVE
  );

  // If an error has been saved from the asynchronous fetch, throw it synchronously.
  if (state.outcome === FETCH_OUTCOME.ERROR) throw state.error;

  /**
   * Perform a fetch using the request URL and method, with the given abort signal allowing the request to be canceled.
   */
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
    // If the user is unauthenticated, reset to the pending state and non-fetching progress.
    if (!isAuthenticated) {
      setState(PENDING_STATE);
      progressDispatch(FetchProgressActionKind.NotFetching);
      return;
    }

    // If `shouldFetch` is false, keep state as-is and set progress to not fetching.
    if (!shouldFetch) {
      progressDispatch(FetchProgressActionKind.NotFetching);
      return;
    }

    // Otherwise, fetch and update state as appropriate.

    progressDispatch(FetchProgressActionKind.Fetching);

    const abortController = new AbortController();

    fetchData(abortController.signal)
      .then((data) => {
        progressDispatch(FetchProgressActionKind.Completed);
        setState({ data, outcome: FETCH_OUTCOME.SUCCESS });
      })
      .catch((error) => {
        if (abortController.signal.aborted) return; // Aborting a request causes the promise to be rejected, so it's necessary to check the abort signal to avoid saving that error.
        progressDispatch(FetchProgressActionKind.Completed);
        setState({ error, outcome: FETCH_OUTCOME.ERROR });
      });

    // Cancel the request if the component unmounts.
    return (): void => {
      abortController.abort();
    };
  }, [fetchData, isAuthenticated, shouldFetch]);

  return state.outcome === FETCH_OUTCOME.SUCCESS
    ? { data: state.data, isSuccess: true, progress }
    : { data: undefined, isSuccess: false, progress };
};

function fetchProgressReducer(
  p: FETCH_PROGRESS,
  a: FetchProgressActionKind
): FETCH_PROGRESS {
  switch (a) {
    case FetchProgressActionKind.Completed:
      return FETCH_PROGRESS.COMPLETED;
    case FetchProgressActionKind.Fetching:
      return FETCH_PROGRESS.FETCHING;
    case FetchProgressActionKind.NotFetching:
      return p === FETCH_PROGRESS.FETCHING ? FETCH_PROGRESS.INACTIVE : p;
  }
}
