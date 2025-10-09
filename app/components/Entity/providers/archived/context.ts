import { createContext } from "react";
import { INITIAL_ARGS } from "./constants";
import { ArchivedStateContextProps } from "./entities";

export const ArchivedContext = createContext<ArchivedStateContextProps>({
  archivedDispatch: null,
  archivedState: INITIAL_ARGS,
});
