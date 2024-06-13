import { FieldValues, Path } from "react-hook-form";
import { YupValidatedFormValues } from "../../../../../../hooks/useForm/common/entities";
import { InputProps } from "../../Input/input";
import { SelectProps } from "../../Select/select";
import { SelectControllerProps } from "../components/SelectController/selectController";

export type ControllerInputConfig = Pick<InputProps, PickedInputProps>;

export type ControllerSelectConfig<T extends FieldValues> = Pick<
  SelectProps,
  PickedSelectProps
> & { SelectComponent: SelectControllerProps<T>["SelectComponent"] };

type PickedInputProps = "label" | "placeholder";
type PickedSelectProps = "displayEmpty" | "label";

export interface ControllerConfig<T extends FieldValues> {
  inputProps?: ControllerInputConfig;
  name: Path<YupValidatedFormValues<T>>;
  selectProps?: ControllerSelectConfig<T>;
}
