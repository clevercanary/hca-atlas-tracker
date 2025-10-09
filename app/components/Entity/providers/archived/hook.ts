import { useContext } from "react";
import { ArchivedContext } from "./context";
import { ArchivedStateContextProps } from "./entities";

export const useArchivedState = (): ArchivedStateContextProps => {
  return useContext(ArchivedContext);
};
