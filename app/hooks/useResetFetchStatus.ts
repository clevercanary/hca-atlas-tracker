import { useEffect } from "react";
import { FetchDataActionKind } from "../providers/fetchDataState/fetchDataState";
import { useFetchDataState } from "./useFetchDataState";

export const useResetFetchStatus = (hasDataFetched: boolean): void => {
  const { fetchDataDispatch } = useFetchDataState();
  useEffect(() => {
    fetchDataDispatch({
      payload: undefined,
      type: FetchDataActionKind.ResetFetchStatus,
    });
  }, [fetchDataDispatch, hasDataFetched]);
};
