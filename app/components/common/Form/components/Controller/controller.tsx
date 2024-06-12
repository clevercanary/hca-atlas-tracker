import { Fragment } from "react";
import { FieldValues } from "react-hook-form";
import { FormMethod } from "../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../hooks/useFormManager/common/entities";
import { ControllerProps as ControllerConfig } from "./common/entities";
import { InputController } from "./components/InputController/inputController";
import { SelectController } from "./components/SelectController/selectController";

export interface ControllerProps<T extends FieldValues, R = undefined> {
  controllerConfigs: ControllerConfig<T>[];
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
}

export const Controller = <T extends FieldValues, R = undefined>({
  controllerConfigs,
  formManager,
  formMethod,
}: ControllerProps<T, R>): JSX.Element => {
  return (
    <Fragment>
      {controllerConfigs.map(({ inputProps, name, selectProps }, i) => {
        const { SelectComponent } = selectProps || {};
        return SelectComponent ? (
          <SelectController
            key={i}
            {...selectProps}
            name={name}
            formManager={formManager}
            formMethod={formMethod}
            SelectComponent={SelectComponent}
          />
        ) : (
          <InputController
            key={i}
            {...inputProps}
            name={name}
            formManager={formManager}
            formMethod={formMethod}
          />
        );
      })}
    </Fragment>
  );
};
