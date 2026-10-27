import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/app/components/common/Snackbar/provider/hook", () => ({
  useSnackbar: jest.fn(),
}));

import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { IconButton } from "@/app/views/IntegratedObjectSourceDatasetsView/components/Table/components/IconButton/iconButton";
import { getUnlinkSuccessMessage } from "@/app/views/IntegratedObjectSourceDatasetsView/components/Table/components/IconButton/utils";
import { EditIntegratedObjectSourceDatasetsContext } from "@/app/views/IntegratedObjectSourceDatasetsView/providers/editIntegratedObjectSourceDatasets/context";

const mockUseSnackbar = useSnackbar as jest.MockedFunction<typeof useSnackbar>;

const INTEGRATED_OBJECT_TITLE = "Test Integrated Object";
const SOURCE_DATASET_ID = "test-source-dataset-id";
const SOURCE_DATASET_TITLE = "Test Source Dataset";

const mockOnOpenSuccess = jest.fn();

/**
 * Renders the unlink button for one row, with an `onDelete` that stays pending
 * until the returned `resolveDelete` is called.
 * @returns the `onDelete` mock and a function resolving its pending call.
 */
function renderIconButton(): {
  onDelete: jest.Mock;
  resolveDelete: (isDeleted: boolean) => void;
} {
  let resolveDelete: ((isDeleted: boolean) => void) | undefined;
  const onDelete = jest.fn(
    () =>
      new Promise<boolean>((resolve) => {
        resolveDelete = resolve;
      }),
  );
  render(
    <EditIntegratedObjectSourceDatasetsContext.Provider
      value={{ integratedObjectTitle: INTEGRATED_OBJECT_TITLE, onDelete }}
    >
      <IconButton
        {...({
          row: {
            original: { id: SOURCE_DATASET_ID, title: SOURCE_DATASET_TITLE },
          },
        } as Parameters<typeof IconButton>[0])}
      />
    </EditIntegratedObjectSourceDatasetsContext.Provider>,
  );
  return {
    onDelete,
    resolveDelete: (isDeleted) => resolveDelete?.(isDeleted),
  };
}

/**
 * Returns the rendered unlink button.
 * @returns unlink button.
 */
function getButton(): HTMLElement {
  return screen.getByRole("button", { name: "Unlink source dataset" });
}

describe("IconButton (unlink source dataset)", () => {
  beforeEach(() => {
    mockOnOpenSuccess.mockReset();
    mockUseSnackbar.mockReturnValue({
      onOpenSuccess: mockOnOpenSuccess,
    } as unknown as ReturnType<typeof useSnackbar>);
  });

  it("is disabled and busy while the unlink is pending, and ignores a second click", () => {
    const { onDelete } = renderIconButton();
    expect(getButton()).not.toHaveAttribute("aria-busy");

    fireEvent.click(getButton());

    expect(getButton()).toBeDisabled();
    expect(getButton()).toHaveAttribute("aria-busy", "true");
    fireEvent.click(getButton());
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith({
      sourceDatasetIds: [SOURCE_DATASET_ID],
    });
  });

  it("clears the pending state and raises no confirmation when the unlink fails", async () => {
    const { resolveDelete } = renderIconButton();
    fireEvent.click(getButton());

    await act(async () => resolveDelete(false));

    expect(getButton()).toBeEnabled();
    expect(getButton()).not.toHaveAttribute("aria-busy");
    expect(mockOnOpenSuccess).not.toHaveBeenCalled();
  });

  it("clears the pending state and raises the confirmation when the unlink succeeds but the row is still rendered", async () => {
    const { resolveDelete } = renderIconButton();
    fireEvent.click(getButton());

    await act(async () => resolveDelete(true));

    expect(getButton()).toBeEnabled();
    expect(getButton()).not.toHaveAttribute("aria-busy");
    expect(mockOnOpenSuccess).toHaveBeenCalledWith(
      getUnlinkSuccessMessage(SOURCE_DATASET_TITLE, INTEGRATED_OBJECT_TITLE),
    );
  });
});
