import { useContext } from "react";
import { ArchivedContext } from "./context";
import { type ArchivedStateContextProps } from "./entities";

export const useArchivedState = (): ArchivedStateContextProps => {
  return useContext(ArchivedContext);
};
