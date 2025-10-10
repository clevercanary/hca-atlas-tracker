import { createContext, Dispatch, ReactNode, useReducer } from "react";
import { fetchDataAction } from "./actions/fetchData/action";
import { resetFetchStatusAction } from "./actions/resetFetchStatus/action";

/**
 * Keyed fetch flags:
 * - `shouldFetchByKey` is empty by default unless provided via `initialState`.
 * - When a hook reads `shouldFetchByKey[key]` and it is `undefined`, passing it to useFetchData(..., shouldFetch) will use the default `shouldFetch = true`, triggering an initial fetch.
 * - On fetch completion, useResetFetchStatus(progress, key) dispatches a keyed reset which persists `shouldFetchByKey[key] = false`.
 * - Future refetches should dispatch fetchData(key) to set `shouldFetchByKey[key] = true` for that key only.
 * - If you want to skip the initial fetch, seed `initialState.shouldFetchByKey[key] = false` in the provider.
 */

export const DEFAULT_FETCH_DATA_STATE = {
  shouldFetch: true,
  shouldFetchByKey: {},
};

export type FetchDataState = {
  shouldFetch: boolean;
  shouldFetchByKey: Record<string, boolean>;
};

export type FetchDataStateContextProps = {
  fetchDataDispatch: Dispatch<FetchDataAction>;
  fetchDataState: FetchDataState;
};

export const FetchDataStateContext = createContext<FetchDataStateContextProps>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- allow dummy function for default state.
  fetchDataDispatch: () => {},
  fetchDataState: DEFAULT_FETCH_DATA_STATE,
});

export interface FetchDataStateProps {
  children: ReactNode | ReactNode[];
  initialState?: Partial<FetchDataState>;
}

export function FetchDataStateProvider({
  children,
  initialState,
}: FetchDataStateProps): JSX.Element {
  const [fetchDataState, fetchDataDispatch] = useReducer(
    (s: FetchDataState, a: FetchDataAction) => fetchDataStateReducer(s, a),
    { ...DEFAULT_FETCH_DATA_STATE, ...initialState }
  );
  return (
    <FetchDataStateContext.Provider
      value={{
        fetchDataDispatch,
        fetchDataState,
      }}
    >
      {children}
    </FetchDataStateContext.Provider>
  );
}

export enum FetchDataActionKind {
  FetchData = "FETCH_DATA",
  ResetFetchStatus = "RESET_FETCH_STATUS",
}

export type FetchDataAction = FetchData | ResetFetchStatus;

/**
 * Requests data to be fetched.
 */
type FetchData = {
  payload?: string[];
  type: FetchDataActionKind.FetchData;
};

/**
 * Resets fetch status.
 */
type ResetFetchStatus = {
  payload?: string[];
  type: FetchDataActionKind.ResetFetchStatus;
};

/**
 * Fetch data state reducer.
 * @param state - Fetch data state.
 * @param action - Fetch data action.
 * @returns fetch data state.
 */
function fetchDataStateReducer(
  state: FetchDataState,
  action: FetchDataAction
): FetchDataState {
  const { payload, type } = action;
  // eslint-disable-next-line sonarjs/no-small-switch -- allow small switch.
  switch (type) {
    case FetchDataActionKind.FetchData: {
      return fetchDataAction(state, payload);
    }
    case FetchDataActionKind.ResetFetchStatus: {
      return resetFetchStatusAction(state, payload);
    }
    default:
      return state;
  }
}
