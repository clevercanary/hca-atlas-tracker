import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { screen } from "@testing-library/react";

const FORM_STATUS: FormManager["formStatus"] = {
  isDirty: false,
  isDisabled: false,
  isLeaving: false,
  isReadOnly: false,
  isSubmitSuccessful: false,
  isSubmitted: false,
  isSubmitting: false,
};

/**
 * Asserts that a button renders as `contained` `primary`.
 * @param name - Button text.
 */
export function expectPrimaryContained(name: string): void {
  expect(getButton(name)).toHaveClass(
    "MuiButton-contained",
    "MuiButton-colorPrimary",
  );
}

/**
 * Asserts that a button renders as findable-ui's white bordered button: `outlined` `secondary`.
 * @param name - Button text.
 */
export function expectSecondaryOutlined(name: string): void {
  expect(getButton(name)).toHaveClass(
    "MuiButton-outlined",
    "MuiButton-colorSecondary",
  );
}

/**
 * Returns the button or button link with the given text.
 * Matching by text skips icon buttons labelled the same, such as a dialog's "Close" icon.
 * @param name - Button text.
 * @returns button element.
 */
export function getButton(name: string): HTMLElement {
  const button = screen.getByText(name).closest("button, a");
  if (!(button instanceof HTMLElement)) {
    throw new Error(`No button with text "${name}".`);
  }
  return button;
}

/**
 * Returns a form manager that can edit, with the given status overrides.
 * @param formStatus - Form status overrides.
 * @returns form manager.
 */
export function makeFormManager(
  formStatus: Partial<FormManager["formStatus"]> = {},
): FormManager {
  return {
    access: { canEdit: true },
    formAction: {
      onCancel: jest.fn(),
      onDelete: jest.fn(),
      onDiscard: jest.fn(),
      onSave: jest.fn(),
    },
    formStatus: { ...FORM_STATUS, ...formStatus },
    isLoading: false,
  };
}
