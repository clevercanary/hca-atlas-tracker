import React from "react";
import { FieldValues, Path } from "react-hook-form";
import {
  FormMethod,
  YupValidatedFormValues,
} from "../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../hooks/useFormManager/common/entities";
import { InputProps } from "../../Input/input";
import { SelectProps } from "../../Select/select";
import { SelectControllerProps } from "../components/SelectController/selectController";

export type ControllerInputConfig = Pick<InputProps, PickedInputProps>;

export type ControllerSelectConfig<T extends FieldValues> = Pick<
  SelectProps,
  PickedSelectProps
> & { SelectComponent: SelectControllerProps<T>["SelectComponent"] };

type PickedInputProps = "label" | "isFullWidth" | "placeholder";
type PickedSelectProps = "displayEmpty" | "label";

export interface StaticControllerConfig<T extends FieldValues> {
  inputProps?: ControllerInputConfig;
  name: Path<YupValidatedFormValues<T>>;
  selectProps?: ControllerSelectConfig<T>;
}

export interface ComponentControllerConfig<T extends FieldValues, R> {
  ControllerComponent: React.FunctionComponent<{
    formManager: FormManager;
    formMethod: FormMethod<T, R>;
  }>;
}

export type ControllerConfig<T extends FieldValues, R = undefined> =
  | StaticControllerConfig<T>
  | ComponentControllerConfig<T, R>;
