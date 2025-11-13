import {
  OutlinedInput as MOutlinedInput,
  OutlinedInputProps as MOutlinedInputProps,
} from "@mui/material";
import { forwardRef, ReactNode } from "react";
import { ControllerViewBuilder } from "../Controllers/common/entities";
import {
  FormHelperText,
  FormHelperTextProps,
} from "../FormHelperText/formHelperText";
import { FormLabel } from "../FormLabel/formLabel";
import { InputFormControl as FormControl } from "./input.styles";
import { getInputProps } from "./utils";

export interface InputProps extends MOutlinedInputProps {
  className?: string;
  helperText?: ReactNode;
  helperTextProps?: Partial<FormHelperTextProps>;
  isFilled?: boolean;
  isFullWidth?: boolean;
  isRowStart?: boolean;
  viewBuilder?: ControllerViewBuilder;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
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
    viewBuilder,
    ...props /* Spread props to allow for Mui OutlinedInputProps specific prop overrides e.g. "disabled". */
  }: InputProps,
  ref
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
        inputProps={getInputProps(props, viewBuilder)}
        ref={ref}
        size="small"
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
});
