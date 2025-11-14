import { InputBaseComponentProps } from "@mui/material";
import { ComponentProps, ElementType } from "react";
import { ControllerViewBuilder } from "../Controllers/common/entities";

/**
 * Get props for the input component.
 * Mui InputBaseComponentProps accommodates arbitrary additional props coming from the `inputProps` prop.
 * @param value - Input value.
 * @param viewBuilder - View builder for the input component.
 * @returns Props for the input component.
 */
export function getInputProps<C extends ElementType = "input">(
  value: unknown,
  viewBuilder?: ControllerViewBuilder<C>
): InputBaseComponentProps & {
  viewProps?: ComponentProps<C>;
} {
  if (viewBuilder) return { viewProps: viewBuilder(value) };
  return { spellCheck: false };
}
