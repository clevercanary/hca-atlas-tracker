import { JSX } from "react";
import { EntityContext } from "./context";
import { EntityData, EntityProviderProps } from "./entities";

export function EntityProvider<D extends EntityData = EntityData>({
  children,
  data,
  formManager,
  formMethod,
  pathParameter,
}: EntityProviderProps<D>): JSX.Element {
  return (
    <EntityContext.Provider
      value={{ data, formManager, formMethod, pathParameter }}
    >
      {children}
    </EntityContext.Provider>
  );
}
