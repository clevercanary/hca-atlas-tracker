import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { SnackbarProvider } from "@/app/components/common/Snackbar/provider/provider";
import { SNACKBAR_SCOPE } from "@/app/components/common/Snackbar/types";
import { PublishDialog } from "@/app/views/AtlasView/components/PublishDialog/publishDialog";
import { Dialog } from "@mui/material";
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import { type JSX, useState } from "react";

const TEST_PATH_PARAMETER = { atlasId: "test-atlas-id" };
const TEST_MESSAGE = "Publish failed";

/**
 * Raises an error on the app-level snackbar when clicked, standing in for a
 * failed request.
 * @returns button that opens the error.
 */
function Opener(): JSX.Element {
  const { onOpen } = useSnackbar();
  return (
    <button
      data-testid="open-error"
      onClick={(): void => onOpen(TEST_MESSAGE, SNACKBAR_SCOPE.PUBLISH_ATLAS)}
    >
      raise error
    </button>
  );
}

/**
 * Raises the error toast.
 * @returns void.
 */
function openError(): void {
  act(() => {
    screen.getByTestId("open-error").click();
  });
}

/**
 * Mounts the snackbar provider with a publish dialog whose open state the test
 * controls, mirroring `_app`: the provider outlives the dialog.
 * @returns harness component.
 */
function Harness(): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <SnackbarProvider>
      <Opener />
      <button data-testid="open-dialog" onClick={(): void => setOpen(true)}>
        open
      </button>
      <PublishDialog
        atlas={undefined}
        onCancel={(): void => setOpen(false)}
        onPublished={(): void => undefined}
        open={open}
        pathParameter={TEST_PATH_PARAMETER}
      />
    </SnackbarProvider>
  );
}

/**
 * Mounts the provider with a plain MUI dialog that never claims the toast's
 * container, standing in for the app's other dialogs.
 * @returns harness component.
 */
function UnclaimedHarness(): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <SnackbarProvider>
      <Opener />
      <button data-testid="open-dialog" onClick={(): void => setOpen(true)}>
        open
      </button>
      <Dialog open={open}>
        <div>an unrelated dialog</div>
      </Dialog>
    </SnackbarProvider>
  );
}

/**
 * Mounts the provider with both a claiming dialog and an unrelated modal, so a
 * test can put the toast through a container change and then open a modal that
 * never claims.
 * @returns harness component.
 */
function ReparentHarness(): JSX.Element {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);
  return (
    <SnackbarProvider>
      <Opener />
      <button
        data-testid="open-dialog"
        onClick={(): void => setDialogOpen(true)}
      >
        open claiming dialog
      </button>
      <button
        data-testid="close-dialog"
        onClick={(): void => setDialogOpen(false)}
      >
        close claiming dialog
      </button>
      <button data-testid="open-other" onClick={(): void => setOtherOpen(true)}>
        open unrelated modal
      </button>
      <PublishDialog
        atlas={undefined}
        onCancel={(): void => setDialogOpen(false)}
        onPublished={(): void => undefined}
        open={dialogOpen}
        pathParameter={TEST_PATH_PARAMETER}
      />
      <Dialog open={otherOpen}>
        <div>an unrelated dialog</div>
      </Dialog>
    </SnackbarProvider>
  );
}

/**
 * Returns the toast's root element, which is what MUI's ModalManager marks and
 * what the container claim re-parents.
 * @returns toast root.
 */
function toastRoot(): HTMLElement {
  const root = screen.getByRole("alert").closest(".MuiSnackbar-root");
  if (!root) throw new Error("toast root not found");
  return root as HTMLElement;
}

/**
 * Opens the dialog and lets the claim's ref callback settle.
 * @returns void.
 */
function openDialog(): void {
  act(() => {
    screen.getByTestId("open-dialog").click();
  });
}

describe("ErrorSnackbar accessibility", () => {
  it("keeps the toast announced when a dialog opens after it", () => {
    // The order that used to break: `ariaHiddenSiblings` iterates
    // `container.children` at modal-mount, so a toast already pinned is an
    // existing child of body and gets marked. `SnackbarContent` is
    // `role="alert"`, which an aria-hidden ancestor suppresses — so the error
    // the user most needs to hear was the one they didn't.
    render(<Harness />);
    openError();
    expect(toastRoot()).not.toHaveAttribute("aria-hidden");

    openDialog();

    expect(toastRoot()).not.toHaveAttribute("aria-hidden");
  });

  it("keeps the toast announced when it opens after the dialog", () => {
    // The already-safe order, asserted so the guard can't regress it.
    render(<Harness />);
    openDialog();
    openError();
    expect(toastRoot()).not.toHaveAttribute("aria-hidden");
  });

  it("renders the toast inside the dialog, so it is within the focus trap", () => {
    // `FocusTrap` enforces focus by DOM containment against the dialog's
    // container element, so a toast merely portalled beside the dialog is
    // untabbable. Containment is the thing that makes it reachable.
    render(<Harness />);
    openError();
    openDialog();

    const dialogContainer = document.querySelector(".MuiDialog-container");
    expect(dialogContainer).not.toBeNull();
    expect(dialogContainer?.contains(toastRoot())).toBe(true);
  });

  it("returns the toast to the body once the dialog closes", () => {
    // The claim is released on `open` flipping false, not on the Paper
    // unmounting — MUI keeps the Paper mounted through the exit transition, so
    // releasing on unmount would leave the toast inside a container fading to
    // `opacity: 0`, visibly fading out with the dialog before reappearing.
    // Asserting the toast is back on `body` while the dialog is still tearing
    // down is what pins that.
    render(<Harness />);
    openError();
    openDialog();
    expect(document.querySelector(".MuiDialog-container")).not.toBeNull();

    act(() => {
      screen.getByRole("button", { name: "Cancel" }).click();
    });

    expect(toastRoot().parentElement).toBe(document.body);
  });

  it("keeps the toast announced when a modal that doesn't claim the container opens", async () => {
    // Most of the app's dialogs — file download, publication status, source
    // study, reprocessed status — never claim the toast's container, so the
    // claim cannot rescue them: `ariaHiddenSiblings` marks the toast and
    // nothing re-parents it into a fresh element. Only the guard clears it.
    render(<UnclaimedHarness />);
    openError();
    expect(toastRoot()).not.toHaveAttribute("aria-hidden");

    // Mount the modal with the toast already pinned — the marking pass runs at
    // modal-mount, so this is the order that breaks.
    openDialog();

    // The guard is a MutationObserver, so its callback is a microtask: the
    // attribute is briefly set and then cleared. Harmless to a screen reader,
    // but it means this has to be awaited rather than asserted synchronously.
    await act(async () => {
      await Promise.resolve();
    });

    expect(toastRoot()).not.toHaveAttribute("aria-hidden");
  });

  it("keeps guarding the toast after a container change has re-mounted it", async () => {
    // The guard observes a DOM node, and changing the portal container remounts
    // the toast into a *fresh* element — the same mechanism that makes a
    // claiming dialog clear the mark incidentally. So a guard bound to a node
    // captured once stops watching the node that actually exists: after a claim
    // and release, it is observing a detached element, and the next modal to
    // mark the live toast goes unnoticed.
    render(<ReparentHarness />);
    openError();

    // Claim, then release — two re-mounts.
    act(() => {
      screen.getByTestId("open-dialog").click();
    });
    act(() => {
      screen.getByTestId("close-dialog").click();
    });

    // A modal that never claims: only the guard can clear this one.
    act(() => {
      screen.getByTestId("open-other").click();
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(toastRoot()).not.toHaveAttribute("aria-hidden");
  });
});
