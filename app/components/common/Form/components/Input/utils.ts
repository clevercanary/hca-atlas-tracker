import { InputBaseComponentProps } from "@mui/material";
import { ComponentProps } from "react";
import { ControllerViewBuilder } from "../Controllers/common/entities";
import { Input } from "./input";

/**
 * Get props for the input component.
 * @param props - Props for the input component.
 * @param viewBuilder - View builder for the input component.
 * @returns Props for the input component.
 */
export function getInputProps(
  props: Pick<ComponentProps<typeof Input>, "value">,
  viewBuilder?: ControllerViewBuilder
): InputBaseComponentProps {
  if (viewBuilder) {
    return { value: viewBuilder(props.value) };
  }
  return { spellCheck: false };
}
