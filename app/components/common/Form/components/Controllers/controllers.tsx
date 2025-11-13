import { Fragment } from "react";
import { FieldValues } from "react-hook-form";
import { FormMethod } from "../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../hooks/useFormManager/common/entities";
import { ControllerConfig } from "./common/entities";
import { InputController } from "./components/InputController/inputController";
import { SelectController } from "./components/SelectController/selectController";

export interface ControllersProps<T extends FieldValues, R = undefined> {
  controllerConfigs: ControllerConfig<T, R>[];
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
}

export const Controllers = <T extends FieldValues, R = undefined>({
  controllerConfigs,
  formManager,
  formMethod,
}: ControllersProps<T, R>): JSX.Element => {
  return (
    <Fragment>
      {controllerConfigs.map(
        (
          {
            inputProps,
            labelLink,
            name,
            renderHelperText,
            selectProps,
            viewBuilder,
          },
          i
        ) => {
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
              inputProps={inputProps}
              name={name}
              formManager={formManager}
              formMethod={formMethod}
              labelLink={labelLink}
              renderHelperText={renderHelperText}
              viewBuilder={viewBuilder}
            />
          );
        }
      )}
    </Fragment>
  );
};
