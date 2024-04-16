import {
  OutlinedInput as MOutlinedInput,
  OutlinedInputProps as MOutlinedInputProps,
} from "@mui/material";
import { forwardRef, ReactNode } from "react";
import { FormHelperText } from "../FormHelperText/formHelperText";
import { FormLabel } from "../FormLabel/formLabel";
import { InputFormControl as FormControl } from "./input.styles";

export interface InputProps extends MOutlinedInputProps {
  className?: string;
  helperText?: ReactNode;
  isFilled?: boolean;
  isFullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    disabled,
    error,
    helperText,
    isFilled = false,
    isFullWidth = false,
    label,
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
    >
      {label && <FormLabel>{label}</FormLabel>}
      <MOutlinedInput
        autoComplete="off"
        disabled={disabled}
        error={error}
        inputProps={{ spellCheck: false }}
        ref={ref}
        size="small"
        {...props}
      />
      {helperText && (
        <FormHelperText disabled={disabled} error={error}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
});
