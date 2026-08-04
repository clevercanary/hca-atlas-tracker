import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { type ElementType, Fragment, type JSX } from "react";
import { type FieldValues } from "react-hook-form";
import { type ControllerConfig } from "./common/entities";
import { InputController } from "./components/InputController/inputController";
import { SelectController } from "./components/SelectController/selectController";

export interface ControllersProps<
  T extends FieldValues,
  R = undefined,
  C extends ElementType = "input",
> {
  controllerConfigs: ControllerConfig<T, R, C>[];
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
}

export const Controllers = <
  T extends FieldValues,
  R = undefined,
  C extends ElementType = "input",
>({
  controllerConfigs,
  formManager,
  formMethod,
}: ControllersProps<T, R, C>): JSX.Element => {
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
          i,
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
        },
      )}
    </Fragment>
  );
};
