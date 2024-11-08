import { Select as MSelect, SelectProps as MSelectProps } from "@mui/material";
import { forwardRef, ReactNode } from "react";
import { FormControl } from "../FormControl/formControl.styles";
import { FormHelperText } from "../FormHelperText/formHelperText";
import { FormLabel } from "../FormLabel/formLabel";

export type SelectProps = MSelectProps & {
  className?: string;
  helperText?: ReactNode;
  isFilled?: boolean;
  isFullWidth?: boolean;
};

export const Select = forwardRef<HTMLInputElement, SelectProps>(function Select(
  {
    children,
    className,
    disabled,
    error,
    helperText,
    isFilled = false,
    isFullWidth = false,
    label,
    onBlur,
    ...props /* Spread props to allow for Mui SelectProps specific prop overrides e.g. "disabled". */
  }: SelectProps,
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
      <MSelect
        fullWidth
        inputProps={{ onBlur }}
        ref={ref}
        size="small"
        {...props}
      >
        {children}
      </MSelect>
      {helperText && (
        <FormHelperText disabled={disabled} error={error}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
});
