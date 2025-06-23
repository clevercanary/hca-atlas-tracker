import { ReactNode } from "react";
import { FieldValues } from "react-hook-form";
import { PathParameter } from "../../common/entities";
import { FormMethod } from "../../hooks/useForm/common/entities";
import { FormManager } from "../../hooks/useFormManager/common/entities";

export interface EntityContextProps<D extends EntityData = EntityData> {
  data: D;
  formManager?: FormManager;
  formMethod?: FormMethod<FieldValues, unknown>;
  pathParameter?: PathParameter;
}

export type EntityData = Record<string, unknown> | undefined;

export interface EntityProviderProps<D extends EntityData = EntityData> {
  children: ReactNode | ReactNode[];
  data?: D;
  formManager?: FormManager;
  formMethod?: FormMethod<FieldValues, unknown>;
  pathParameter?: PathParameter;
}
