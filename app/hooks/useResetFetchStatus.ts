import { useEffect } from "react";
import { FetchDataActionKind } from "../providers/fetchDataState/fetchDataState";
import { FETCH_PROGRESS } from "./useFetchData";
import { useFetchDataState } from "./useFetchDataState";

export const useResetFetchStatus = (fetchProgress: FETCH_PROGRESS): void => {
  const { fetchDataDispatch } = useFetchDataState();
  useEffect(() => {
    if (fetchProgress === FETCH_PROGRESS.COMPLETED)
      fetchDataDispatch({
        payload: undefined,
        type: FetchDataActionKind.ResetFetchStatus,
      });
  }, [fetchDataDispatch, fetchProgress]);
};
