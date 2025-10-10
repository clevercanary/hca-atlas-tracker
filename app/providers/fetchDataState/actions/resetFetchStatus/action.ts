import { FetchDataState } from "../../fetchDataState";

/**
 * Reducer function to handle the "reset fetch status" action.
 * Payload comprising of a string key to identify the data to be reset will be set to `false`.
 * When no payload is provided, `shouldFetch` will be set to `false`.
 * @param state - Fetch data state.
 * @param payload - Payload.
 * @returns fetch data state.
 */
export function resetFetchStatusAction(
  state: FetchDataState,
  payload?: string
): FetchDataState {
  if (!payload) return { ...state, shouldFetch: false };

  return {
    ...state,
    shouldFetchByKey: {
      ...state.shouldFetchByKey,
      [payload]: false,
    },
  };
}
