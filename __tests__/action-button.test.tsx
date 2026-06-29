import { render, screen } from "@testing-library/react";

jest.mock("../app/hooks/useFormManager/useFormManager", () => ({
  useFormManager: jest.fn(),
}));

import { useFormManager } from "../app/hooks/useFormManager/useFormManager";
import { ActionButton } from "../app/views/EntitiesView/components/ActionButton/actionButton";

const mockUseFormManager = useFormManager as jest.MockedFunction<
  typeof useFormManager
>;

/**
 * Set the `canEdit` access flag returned by the mocked useFormManager.
 * @param canEdit - Whether the current user can edit.
 * @returns void.
 */
function mockCanEdit(canEdit: boolean): void {
  mockUseFormManager.mockReturnValue({
    access: { canEdit },
  } as ReturnType<typeof useFormManager>);
}

describe("ActionButton", () => {
  beforeEach(() => {
    mockUseFormManager.mockReset();
  });

  it("renders the action when the user can edit (admin entry point)", () => {
    mockCanEdit(true);
    render(<ActionButton>Add User</ActionButton>);
    expect(screen.queryByText("Add User")).not.toBeNull();
  });

  it("renders nothing when the user cannot edit (non-admin)", () => {
    mockCanEdit(false);
    render(<ActionButton>Add User</ActionButton>);
    expect(screen.queryByText("Add User")).toBeNull();
  });
});
