import { ButtonProps } from "@clevercanary/data-explorer-ui/lib/components/common/Button/button";
import { FieldValues } from "react-hook-form";
import { FormMethod } from "../../../../../../../hooks/useForm/common/entities";

/**
 * Form management banner discard button props.
 * @param onDiscard - Callback to discard form changes.
 * @returns discard button props.
 */
export function getFormDiscardProps(
  onDiscard: () => void
): Partial<ButtonProps> {
  return {
    onClick: onDiscard,
  };
}

/**
 * Form management banner save button props.
 * @param formMethod - Form method.
 * @param onSave - Callback to save form.
 * @returns save button props.
 */
export function getFormSaveProps<T extends FieldValues, R = undefined>(
  formMethod: FormMethod<T, R>,
  onSave: () => void
): Partial<ButtonProps> {
  const {
    disabled,
    formState: { isDirty },
  } = formMethod;
  return {
    disabled: disabled || !isDirty,
    onClick: onSave,
  };
}
