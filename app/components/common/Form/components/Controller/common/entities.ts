import { FieldValues, Path } from "react-hook-form";
import { YupValidatedFormValues } from "../../../../../../hooks/useForm/common/entities";
import { InputProps } from "../../Input/input";
import { SelectProps } from "../../Select/select";
import { SelectControllerProps } from "../components/SelectController/selectController";

type DefaultInputProps = "label" | "placeholder";
type DefaultSelectProps = "displayEmpty" | "label";

type ControllerSelectProps<T extends FieldValues> = Pick<
  SelectProps,
  DefaultSelectProps
> & { SelectComponent: SelectControllerProps<T>["SelectComponent"] };

export interface ControllerProps<T extends FieldValues> {
  inputProps?: Pick<InputProps, DefaultInputProps>;
  name: Path<YupValidatedFormValues<T>>;
  selectProps?: ControllerSelectProps<T>;
}
