import { FetchDataState } from "../../fetchDataState";

/**
 * Reducer function to handle the "fetch data" action.
 * Payload comprising of a string key to identify the data to be fetched will be set to `true`.
 * When no payload is provided, `shouldFetch` will be set to `true`.
 * @param state - Fetch data state.
 * @param payload - Payload.
 * @returns fetch data state.
 */
export function fetchDataAction(
  state: FetchDataState,
  payload?: string[]
): FetchDataState {
  if (!payload) return { ...state, shouldFetch: true };

  // Create a new object to store the next state.
  const nextShouldFetchByKey: Record<string, boolean> = {};

  // Set the keys to true.
  payload.forEach((key) => {
    nextShouldFetchByKey[key] = true;
  });

  return {
    ...state,
    shouldFetchByKey: {
      ...state.shouldFetchByKey,
      ...nextShouldFetchByKey,
    },
  };
}
