import {
  OutlinedInput as MOutlinedInput,
  OutlinedInputProps as MOutlinedInputProps,
} from "@mui/material";
import {
  ElementType,
  forwardRef,
  JSX,
  ReactNode,
  Ref,
  RefAttributes,
} from "react";
import { ControllerViewBuilder } from "../Controllers/common/entities";
import {
  FormHelperText,
  FormHelperTextProps,
} from "../FormHelperText/formHelperText";
import { FormLabel } from "../FormLabel/formLabel";
import { InputFormControl as FormControl } from "./input.styles";
import { getInputComponent, getInputProps } from "./utils";

export interface InputProps<
  C extends ElementType = "input",
> extends MOutlinedInputProps {
  className?: string;
  helperText?: ReactNode;
  helperTextProps?: Partial<FormHelperTextProps>;
  isFilled?: boolean;
  isFullWidth?: boolean;
  isRowStart?: boolean;
  /**
   * Builds the props passed to `inputComponent` from the current field value.
   * Returning `undefined` signals "no special view to inject" — the field then
   * falls back to MUI's default text input (i.e., `inputComponent` is suppressed
   * for that render).
   */
  viewBuilder?: ControllerViewBuilder<C>;
}

function InputBase<C extends ElementType = "input">(
  {
    className,
    disabled,
    error,
    helperText,
    helperTextProps,
    inputComponent,
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
  const inputProps = getInputProps(value, viewBuilder);
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
        inputComponent={getInputComponent(inputComponent, inputProps)}
        // Safe to set (not merge) because `ControllerInputConfig` doesn't expose
        // MUI's `inputProps` — `InputController` is the only caller.
        inputProps={inputProps}
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
