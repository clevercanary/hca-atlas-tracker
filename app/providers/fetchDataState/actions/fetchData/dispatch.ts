import { FetchDataAction, FetchDataActionKind } from "../../fetchDataState";

/**
 * Action creator for fetching data.
 * @param payload - Payload.
 * @returns Action with payload and action type.
 */
export function fetchData(payload?: string[]): FetchDataAction {
  return {
    payload,
    type: FetchDataActionKind.FetchData,
  };
}
