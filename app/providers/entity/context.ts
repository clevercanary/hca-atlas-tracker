import { createContext } from "react";
import { EntityContextProps } from "./entities";

export const EntityContext = createContext<EntityContextProps>({
  data: undefined,
  formManager: undefined,
  formMethod: undefined,
  pathParameter: undefined,
});
