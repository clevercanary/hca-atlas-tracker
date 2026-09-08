// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { fetchResource } from "@/app/common/utils";
import { SnackbarProvider } from "@/app/components/common/Snackbar/provider/provider";
import { PublishDialog } from "@/app/views/AtlasView/components/PublishDialog/publishDialog";
import { createMockResponse, promiseWithResolvers } from "@/testing/utils";
import "@testing-library/jest-dom";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { type JSX, useState } from "react";

const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

const TEST_PATH_PARAMETER = { atlasId: "test-atlas-id" };

/**
 * Mounts the dialog the way `AtlasView` does — rendered always, opened by a
 * prop — so it stays mounted across open and close.
 * @returns harness component.
 */
function Harness(): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <SnackbarProvider>
      <button data-testid="open" onClick={(): void => setOpen(true)}>
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
 * Opens the dialog and clicks Publish, letting the request settle.
 * @returns promise resolving once the attempt has completed.
 */
async function publish(): Promise<void> {
  await act(async () => {
    screen.getByRole("button", { name: "Publish" }).click();
  });
}

/**
 * Clicks the harness trigger.
 * @returns void.
 */
function openDialog(): void {
  act(() => {
    screen.getByTestId("open").click();
  });
}

/**
 * Renders the dialog permanently open with an observable `onCancel`. Whether
 * the dialog asked to close is then a fact about the mock, not about a DOM
 * removal the exit transition delays by ~195ms.
 * @returns the onCancel mock.
 */
function renderOpen(): jest.Mock {
  const onCancel = jest.fn();
  render(
    <SnackbarProvider>
      <PublishDialog
        atlas={undefined}
        onCancel={onCancel}
        onPublished={(): void => undefined}
        open
        pathParameter={TEST_PATH_PARAMETER}
      />
    </SnackbarProvider>,
  );
  return onCancel;
}

/**
 * The dialog title's close button. Queried structurally because findable-ui's
 * `DialogTitle` renders it as an icon button with no accessible name, so it
 * can't be reached by role and name.
 * @returns the title's close button.
 */
function titleCloseButton(): HTMLElement {
  const button = document.querySelector(
    ".MuiDialogTitle-root .MuiIconButton-root",
  );
  if (!(button instanceof HTMLElement))
    throw new Error("dialog title close button not found");
  return button;
}

/**
 * The open dialog's backdrop.
 * @returns the backdrop element.
 */
function backdrop(): HTMLElement {
  const element = document.querySelector(".MuiBackdrop-root");
  if (!(element instanceof HTMLElement)) throw new Error("backdrop not found");
  return element;
}

/**
 * Starts a publish and leaves the request in flight.
 * @returns resolve function for the pending response.
 */
function publishPending(): (response: Response) => void {
  const [pending, respond] = promiseWithResolvers<Response>();
  mockFetchResource.mockReturnValue(pending);
  act(() => {
    screen.getByRole("button", { name: "Publish" }).click();
  });
  return respond;
}

/**
 * The dialog's error region. Mounted for as long as the dialog is, message or
 * not, so "no error" is an empty region rather than an absent one — hence
 * `toBeEmptyDOMElement` below where a conditional region would be queried for
 * absence.
 * @returns the live region.
 */
function errorRegion(): HTMLElement {
  return screen.getByRole("alert");
}

describe("confirmation dialog inline errors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows a failure inside the dialog rather than on the error stack", async () => {
    // The stack sits below `zIndex.modal`, outside the focus trap, and is
    // marked `aria-hidden` while a dialog is open — and this app's backdrop is
    // 90% ink. A publish failure routed there would be neither readable nor
    // announced until the dialog was closed, on an irreversible action.
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden for this atlas" }),
    );
    render(<Harness />);
    openDialog();

    await publish();

    const alert = errorRegion();
    expect(alert).toHaveTextContent("Forbidden for this atlas");
    // Inside the dialog's own subtree, which is what makes it reachable and
    // announced: the dialog carries `aria-modal="true"`, so assistive tech is
    // told to ignore everything outside it.
    expect(document.querySelector(".MuiDialog-paper")?.contains(alert)).toBe(
      true,
    );
    // And nothing was raised on the app stack.
    expect(document.querySelector(".MuiSnackbarContent-root")).toBeNull();
  });

  it("keeps the dialog open on failure, so the action can be retried", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(500));
    render(<Harness />);
    openDialog();

    await publish();

    expect(screen.getByRole("button", { name: "Publish" })).toBeEnabled();
  });

  it("clears the error when a retry succeeds", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(500));
    render(<Harness />);
    openDialog();
    await publish();
    expect(errorRegion()).not.toBeEmptyDOMElement();

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await publish();

    await waitFor(() => expect(errorRegion()).toBeEmptyDOMElement());
  });

  it("clears a previous failure when the dialog is reopened", async () => {
    // The hook outlives the dialog's visibility, so without a clear a fresh
    // attempt would greet the user with the last one's failure.
    mockFetchResource.mockResolvedValue(createMockResponse(500));
    render(<Harness />);
    openDialog();
    await publish();
    expect(errorRegion()).not.toBeEmptyDOMElement();

    act(() => {
      screen.getByRole("button", { name: "Cancel" }).click();
    });
    await waitFor(() =>
      expect(document.querySelector(".MuiDialog-root")).toBeNull(),
    );
    openDialog();

    expect(errorRegion()).toBeEmptyDOMElement();
  });

  it("clears the error when the dialog is reopened before it finishes closing", async () => {
    // Not a user-reachable sequence — the modal's backdrop covers the trigger,
    // and focus stays trapped in the dialog until the exit finishes — but it
    // pins why the clear can't be keyed on `onExited` alone: an exit
    // interrupted by a reopen never fires it. The enter clear covers it.
    mockFetchResource.mockResolvedValue(createMockResponse(500));
    render(<Harness />);
    openDialog();
    await publish();
    expect(errorRegion()).not.toBeEmptyDOMElement();

    act(() => {
      screen.getByRole("button", { name: "Cancel" }).click();
    });
    openDialog();

    expect(errorRegion()).toBeEmptyDOMElement();
  });

  it("clears a failure that landed after the dialog was closed mid-request", async () => {
    // The title's close button is the one exit left open mid-request — Cancel
    // is disabled, escape and the backdrop are guarded — so the failure
    // arrives after `onExited` has already run and sets `error` on a closed
    // but still-mounted dialog. Without the enter clear, the next confirmation
    // for an irreversible action opens showing it.
    render(<Harness />);
    openDialog();
    const respond = publishPending();

    act(() => {
      titleCloseButton().click();
    });
    await waitFor(() =>
      expect(document.querySelector(".MuiDialog-root")).toBeNull(),
    );
    await act(async () => {
      respond(createMockResponse(403, { message: "Forbidden for this atlas" }));
    });

    openDialog();

    expect(errorRegion()).toBeEmptyDOMElement();
  });

  it("ignores escape while the request is in flight, and honours it after", async () => {
    // The dialog confirms an irreversible action and the request is already
    // away, so a stray escape must not close it — that would leave the user
    // with no report of how it went. The guard is keyed on the in-flight flag,
    // which resets on every outcome, so a failure can't leave the dialog
    // un-closable either.
    const onCancel = renderOpen();
    const respond = publishPending();

    act(() => {
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    });
    expect(onCancel).not.toHaveBeenCalled();

    await act(async () => {
      respond(createMockResponse(500));
    });
    act(() => {
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("ignores a backdrop click while the request is in flight, and honours it after", async () => {
    const onCancel = renderOpen();
    const respond = publishPending();

    act(() => {
      backdrop().click();
    });
    expect(onCancel).not.toHaveBeenCalled();

    await act(async () => {
      respond(createMockResponse(500));
    });
    act(() => {
      backdrop().click();
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("mounts the error region with the dialog, before there is anything to say", async () => {
    // The announcement contract: a `role="alert"` inserted together with its
    // text is missed by JAWS and NVDA often enough to matter, and this is the
    // only report a failed publish gets. The region has to be in the
    // accessibility tree before the message is swapped in.
    mockFetchResource.mockResolvedValue(createMockResponse(500));
    render(<Harness />);

    openDialog();

    const region = errorRegion();
    expect(region).toBeEmptyDOMElement();

    await publish();

    // The same node, now carrying the message — not a replacement.
    expect(errorRegion()).toBe(region);
    expect(region).not.toBeEmptyDOMElement();
  });
});
