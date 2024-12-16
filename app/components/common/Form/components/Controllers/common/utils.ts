import { ReactNode } from "react";
import { FieldValues } from "react-hook-form";
import { FormMethod } from "../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../hooks/useFormManager/common/entities";
import { ComponentControllerConfig } from "./entities";

export function controllerConfigWithProps<T extends FieldValues, R, TProps>(
  component: React.FunctionComponent<
    Omit<TProps, "formManager" | "formMethod"> & {
      formManager: FormManager;
      formMethod: FormMethod<T, R>;
    }
  >,
  props: Omit<TProps, "formManager" | "formMethod">
): ComponentControllerConfig<T, R> {
  return {
    ControllerComponent({ formManager, formMethod }): ReactNode {
      return component({
        formManager,
        formMethod,
        ...props,
      });
    },
  };
}
