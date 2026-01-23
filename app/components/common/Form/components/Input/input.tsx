import {
  OutlinedInput as MOutlinedInput,
  OutlinedInputProps as MOutlinedInputProps,
} from "@mui/material";
import { ElementType, forwardRef, ReactNode, Ref, RefAttributes } from "react";
import { ControllerViewBuilder } from "../Controllers/common/entities";
import {
  FormHelperText,
  FormHelperTextProps,
} from "../FormHelperText/formHelperText";
import { FormLabel } from "../FormLabel/formLabel";
import { InputFormControl as FormControl } from "./input.styles";
import { getInputProps } from "./utils";

export interface InputProps<
  C extends ElementType = "input",
> extends MOutlinedInputProps {
  className?: string;
  helperText?: ReactNode;
  helperTextProps?: Partial<FormHelperTextProps>;
  isFilled?: boolean;
  isFullWidth?: boolean;
  isRowStart?: boolean;
  viewBuilder?: ControllerViewBuilder<C>;
}

function InputBase<C extends ElementType = "input">(
  {
    className,
    disabled,
    error,
    helperText,
    helperTextProps,
    isFilled = false,
    isFullWidth = false,
    isRowStart = false,
    label,
    value,
    viewBuilder,
    ...props /* Spread props to allow for Mui OutlinedInputProps specific prop overrides e.g. "disabled". */
  }: InputProps<C>,
  ref: Ref<HTMLInputElement>,
): JSX.Element {
  return (
    <FormControl
      className={className}
      color={error ? "warning" : undefined}
      disabled={disabled}
      error={error}
      isFilled={isFilled}
      isFullWidth={isFullWidth}
      isRowStart={isRowStart}
    >
      {label && <FormLabel>{label}</FormLabel>}
      <MOutlinedInput
        autoComplete="off"
        disabled={disabled}
        error={error}
        inputProps={getInputProps(value, viewBuilder)}
        ref={ref}
        size="small"
        // Handle null values.
        value={value ?? ""}
        {...props}
      />
      {helperText && (
        <FormHelperText
          disabled={disabled}
          error={error}
          noWrap={!error}
          {...helperTextProps}
        >
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}

export const Input = forwardRef(InputBase) as <C extends ElementType = "input">(
  props: InputProps<C> & RefAttributes<HTMLInputElement>,
) => JSX.Element;
