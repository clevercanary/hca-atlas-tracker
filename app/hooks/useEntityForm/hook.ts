import { useContext } from "react";
import { EntityContext } from "../../providers/entity/context";
import { EntityContextProps } from "../../providers/entity/entities";

/**
 * Returns the data, formManager, formMethod, and pathParameter properties from the entity provider.
 * To be used by form related components that require data, formManager, formMethod, and pathParameter to be defined.
 * @returns {EntityContextProps} - Entity context.
 * @throws {Error} - Throws an error if either data, formManager, formMethod, or pathParameter is not found.
 */
export const useEntityForm = (): Required<EntityContextProps> => {
  const context = useContext(EntityContext);
  const { data, formManager, formMethod, pathParameter } = context;

  // The entity form hook expects the entity provider to be used
  // with data, formManager, formMethod, and pathParameter properties defined.
  if (!data) throw new Error("EntityProvider data not found");
  if (!formManager) throw new Error("EntityProvider formManager not found");
  if (!formMethod) throw new Error("EntityProvider formMethod not found");
  if (!pathParameter) throw new Error("EntityProvider pathParameter not found");

  return { data, formManager, formMethod, pathParameter };
};
