import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
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
  shouldFetch = true,
): UseFetchData<D> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  const [state, setState] = useState<FetchState<D>>(PENDING_STATE);
  const [wasAuthenticated, setWasAuthenticated] = useState(isAuthenticated);

  const [progress, progressDispatch] = useReducer(
    fetchProgressReducer,
    FETCH_PROGRESS.INACTIVE,
  );

  // Reset to the pending state the moment the user logs out so fetched data
  // can't survive logout. Adjusting state during render (React re-renders
  // immediately and discards the intermediate, so it's flash-free) rather than
  // in an effect avoids the cascading re-render flagged by
  // react-hooks/set-state-in-effect.
  if (wasAuthenticated !== isAuthenticated) {
    setWasAuthenticated(isAuthenticated);
    if (!isAuthenticated) setState(PENDING_STATE);
  }

  // If an error has been saved from the asynchronous fetch, throw it
  // synchronously — but only while authenticated, so logging out clears the
  // error (reset to pending during render above) rather than re-throwing a
  // stale error to a logged-out user.
  if (isAuthenticated && state.outcome === FETCH_OUTCOME.ERROR)
    throw state.error;

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
          .catch(() => `Received ${res.status} response`),
      );
    },
    [method, requestUrl],
  );

  useEffect(() => {
    // If the user is unauthenticated, set progress to non-fetching. (State is
    // reset to the pending state during render — see above.)
    if (!isAuthenticated) {
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
  a: FetchProgressActionKind,
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
