import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { FieldValues, Path } from "react-hook-form";
import { YupValidatedFormValues } from "../../../../../../hooks/useForm/common/entities";
import { InputProps } from "../../Input/input";
import { SelectProps } from "../../Select/select";
import { LabelLinkConfig } from "../components/InputController/inputController";
import { SelectControllerProps } from "../components/SelectController/selectController";

export type ControllerInputConfig = Pick<InputProps, PickedInputProps>;

export type ControllerSelectConfig<T extends FieldValues> = Pick<
  SelectProps,
  PickedSelectProps
> & {
  SelectComponent: SelectControllerProps<T>["SelectComponent"];
};

// Extract the inner viewProps type only if the component actually has it.
export type ViewPropsOf<C extends ElementType> =
  ComponentPropsWithoutRef<C> extends {
    viewProps?: infer P;
  }
    ? P
    : never;

export type ControllerViewBuilder<C extends ElementType = "input"> = (
  value: unknown
) => ViewPropsOf<C>;

type PickedInputProps =
  | "label"
  | "helperTextProps"
  | "inputComponent"
  | "isFullWidth"
  | "isRowStart"
  | "placeholder"
  | "readOnly";

type PickedSelectProps = "displayEmpty" | "label" | "isRowStart";

export interface ControllerConfig<
  T extends FieldValues,
  R = undefined,
  C extends ElementType = "input"
> {
  inputProps?: ControllerInputConfig;
  labelLink?: LabelLinkConfig | true;
  name: Path<YupValidatedFormValues<T>>;
  renderHelperText?: (data?: R) => ReactNode;
  selectProps?: ControllerSelectConfig<T>;
  viewBuilder?: ControllerViewBuilder<C>;
}
