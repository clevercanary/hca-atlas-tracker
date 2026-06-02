import { InputBaseComponentProps } from "@mui/material";
import { ElementType } from "react";
import {
  ControllerViewBuilder,
  ViewPropsOf,
} from "../Controllers/common/entities";

/**
 * Resolve the input component to render. If `inputProps.viewProps` is undefined
 * (i.e. the `viewBuilder` returned nothing), `inputComponent` is suppressed and
 * the field falls back to MUI's default text input.
 * @param inputComponent - Configured input component.
 * @param inputProps - Props returned by `getInputProps`.
 * @returns Effective input component, or undefined to fall back to default rendering.
 */
export function getInputComponent(
  inputComponent: ElementType<InputBaseComponentProps> | undefined,
  inputProps: InputBaseComponentProps & { viewProps?: unknown },
): ElementType<InputBaseComponentProps> | undefined {
  return inputProps.viewProps === undefined ? undefined : inputComponent;
}

/**
 * Get props for the input component.
 * Mui InputBaseComponentProps accommodates arbitrary additional props coming from the `inputProps` prop.
 * When `viewBuilder` is set but returns undefined, the result omits `viewProps`
 * entirely so the default `<input>` element doesn't receive an unknown DOM prop.
 * @param value - Input value.
 * @param viewBuilder - View builder for the input component.
 * @returns Props for the input component.
 */
export function getInputProps<C extends ElementType = "input">(
  value: unknown,
  viewBuilder?: ControllerViewBuilder<C>,
): InputBaseComponentProps & { viewProps?: ViewPropsOf<C> } {
  if (viewBuilder) {
    const viewProps = viewBuilder(value);
    if (viewProps !== undefined) return { viewProps };
  }
  return { spellCheck: false };
}
