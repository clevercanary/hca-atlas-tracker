import { createContext, Dispatch, ReactNode, useReducer } from "react";

export const DEFAULT_FETCH_DATA_STATE = {
  shouldFetch: true,
};

export type FetchDataState = {
  shouldFetch: boolean;
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
  payload: undefined;
  type: FetchDataActionKind.FetchData;
};

/**
 * Resets fetch status.
 */
type ResetFetchStatus = {
  payload: undefined;
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
  const { type } = action;
  // eslint-disable-next-line sonarjs/no-small-switch -- allow small switch.
  switch (type) {
    case FetchDataActionKind.FetchData: {
      return {
        ...state,
        shouldFetch: true,
      };
    }
    case FetchDataActionKind.ResetFetchStatus: {
      return {
        ...state,
        shouldFetch: false,
      };
    }
    default:
      return state;
  }
}
