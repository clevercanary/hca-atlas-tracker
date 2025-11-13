import { InputBaseComponentProps } from "@mui/material";
import { ReactNode } from "react";
import { FieldValues, Path } from "react-hook-form";
import { YupValidatedFormValues } from "../../../../../../hooks/useForm/common/entities";
import { InputProps } from "../../Input/input";
import { SelectProps } from "../../Select/select";
import { LabelLinkConfig } from "../components/InputController/inputController";
import { SelectControllerProps } from "../components/SelectController/selectController";

export type ControllerInputConfig = Pick<InputProps, PickedInputProps> & {
  isRowStart?: boolean;
};

export type ControllerSelectConfig<T extends FieldValues> = Pick<
  SelectProps,
  PickedSelectProps
> & {
  isRowStart?: boolean;
  SelectComponent: SelectControllerProps<T>["SelectComponent"];
};

export type ControllerViewBuilder = (
  value: unknown
) => InputBaseComponentProps["value"];

type PickedInputProps =
  | "label"
  | "helperTextProps"
  | "inputComponent"
  | "isFullWidth"
  | "placeholder"
  | "readOnly";

type PickedSelectProps = "displayEmpty" | "label";

export interface ControllerConfig<T extends FieldValues, R = undefined> {
  inputProps?: ControllerInputConfig;
  labelLink?: LabelLinkConfig | true;
  name: Path<YupValidatedFormValues<T>>;
  renderHelperText?: (data?: R) => ReactNode;
  selectProps?: ControllerSelectConfig<T>;
  viewBuilder?: ControllerViewBuilder;
}
