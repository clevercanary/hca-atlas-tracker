import { ReactNode, useReducer } from "react";
import { INITIAL_ARGS } from "./constants";
import { ArchivedContext } from "./context";
import { archivedReducer } from "./reducer";

export function ArchivedProvider({
  children,
}: {
  children: ReactNode | ReactNode[];
}): JSX.Element {
  const [archivedState, archivedDispatch] = useReducer(
    archivedReducer,
    INITIAL_ARGS
  );
  return (
    <ArchivedContext.Provider value={{ archivedDispatch, archivedState }}>
      {children}
    </ArchivedContext.Provider>
  );
}
