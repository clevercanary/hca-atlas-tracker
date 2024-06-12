import { useContext } from "react";
import {
  FetchDataStateContext,
  FetchDataStateContextProps,
} from "../providers/fetchDataState/fetchDataState";

export const useFetchDataState = (): FetchDataStateContextProps => {
  return useContext(FetchDataStateContext);
};
