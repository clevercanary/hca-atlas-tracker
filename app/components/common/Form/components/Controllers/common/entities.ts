import { ComponentProps, ElementType, ReactNode } from "react";
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

export type ControllerViewBuilder<C extends ElementType = "input"> = (
  value: unknown
) => ComponentProps<C>; // Returns component-specific props forwarded to the inputComponent via MUI inputProps under the `viewProps` key; may be a complex object (e.g., Chip props like { color, label, variant }).

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
