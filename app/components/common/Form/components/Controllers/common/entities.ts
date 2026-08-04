import { type LabelLinkConfig } from "@/app/components/common/Form/components/Controllers/components/InputController/inputController";
import { type SelectControllerProps } from "@/app/components/common/Form/components/Controllers/components/SelectController/selectController";
import { type InputProps } from "@/app/components/common/Form/components/Input/input";
import { type SelectProps } from "@/app/components/common/Form/components/Select/select";
import { type YupValidatedFormValues } from "@/app/hooks/useForm/common/entities";
import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";
import { type FieldValues, type Path } from "react-hook-form";

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
  value: unknown,
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
  C extends ElementType = "input",
> {
  inputProps?: ControllerInputConfig;
  labelLink?: LabelLinkConfig | true;
  name: Path<YupValidatedFormValues<T>>;
  renderHelperText?: (data?: R) => ReactNode;
  selectProps?: ControllerSelectConfig<T>;
  viewBuilder?: ControllerViewBuilder<C>;
}
