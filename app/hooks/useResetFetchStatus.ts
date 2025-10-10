import { useEffect } from "react";
import { resetFetchStatus } from "../providers/fetchDataState/actions/resetFetchStatus/dispatch";
import { FETCH_PROGRESS } from "./useFetchData";
import { useFetchDataState } from "./useFetchDataState";

/**
 * Resets fetch status when `fetchProgress` becomes COMPLETED.
 * - If `fetchKey` is provided, dispatches a keyed reset, persisting `shouldFetchByKey[fetchKey] = false`.
 * - Pairs with hooks that initially see `shouldFetchByKey[key] === undefined`; passing that value to [useFetchData(..., shouldFetch)] uses the hook’s default `shouldFetch = true`, triggering the initial fetch.
 * - After completion, the key is added to state with `false`.
 * - Trigger subsequent refetches with [fetchData(fetchKey)] to set `shouldFetchByKey[fetchKey] = true`.
 * - To skip the initial fetch, seed `initialState.shouldFetchByKey[fetchKey] = false` in the provider.
 */

export const useResetFetchStatus = (
  fetchProgress: FETCH_PROGRESS,
  fetchKey?: string
): void => {
  const { fetchDataDispatch } = useFetchDataState();
  useEffect(() => {
    if (fetchProgress === FETCH_PROGRESS.COMPLETED)
      fetchDataDispatch(resetFetchStatus(fetchKey));
  }, [fetchKey, fetchDataDispatch, fetchProgress]);
};
