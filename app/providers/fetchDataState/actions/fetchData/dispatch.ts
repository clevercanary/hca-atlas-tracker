import { FetchDataAction, FetchDataActionKind } from "../../fetchDataState";

/**
 * Action creator for fetching data.
 * @returns Action with payload and action type.
 */
export function fetchData(): FetchDataAction {
  return {
    payload: undefined,
    type: FetchDataActionKind.FetchData,
  };
}
