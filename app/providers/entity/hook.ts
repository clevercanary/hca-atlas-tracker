import { useContext } from "react";
import { EntityContext } from "./context";
import { EntityContextProps } from "./entities";

export const useEntity = (): EntityContextProps => {
  return useContext(EntityContext);
};
