import { PathParameter } from "@/app/common/entities";
import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { FormManager } from "@/app/hooks/useFormManager/common/entities";
import { ReactNode } from "react";
import { FieldValues } from "react-hook-form";

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
