// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { fetchResource } from "@/app/common/utils";
import { CreateRevisionDialog } from "@/app/views/AtlasView/components/CreateRevisionDialog/createRevisionDialog";
import { PublishDialog } from "@/app/views/AtlasView/components/PublishDialog/publishDialog";
import { createQuerySnackbarWrapper } from "@/testing/snackbar";
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

// The dialogs' request hook reads the query client as well as the snackbar.
const Providers = createQuerySnackbarWrapper();

/**
 * Mounts the dialog the way `AtlasView` does — rendered always, opened by a
 * prop — so it stays mounted across open and close.
 * @returns harness component.
 */
function Harness(): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <Providers>
      <button data-testid="open" onClick={(): void => setOpen(true)}>
        open
      </button>
      {/*
       * A close the dialog doesn't control — a route change or a remount when
       * `isDirty` flips. Since every exit the dialog owns is withheld
       * mid-request, this is the only way a confirmation can now disappear
       * while its request is still running.
       */}
      <button
        data-testid="close-externally"
        onClick={(): void => setOpen(false)}
      >
        close
      </button>
      <PublishDialog
        atlas={undefined}
        onCancel={(): void => setOpen(false)}
        onPublished={(): void => undefined}
        open={open}
        pathParameter={TEST_PATH_PARAMETER}
      />
    </Providers>
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
 * Closes the dialog from outside, bypassing its own controls.
 * @returns void.
 */
function closeDialogExternally(): void {
  act(() => {
    screen.getByTestId("close-externally").click();
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
    <Providers>
      <PublishDialog
        atlas={undefined}
        onCancel={onCancel}
        onPublished={(): void => undefined}
        open
        pathParameter={TEST_PATH_PARAMETER}
      />
    </Providers>,
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

/**
 * The two confirmation dialogs, which carry the same mid-request guard —
 * withheld `onClose`, withheld title close button, disabled buttons, inline
 * error region — written out separately in each component.
 *
 * Parameterised rather than tested once against `PublishDialog`: the guard is
 * duplicated, so testing one copy proves nothing about the other, and the two
 * would drift silently. Only the guard is shared here; behaviour that differs
 * (the revision dialog latches `succeeded` and navigates with
 * `location.assign`) stays with its own hook suite.
 */
const GUARDED_DIALOGS = [
  {
    confirmName: "Publish",
    label: "PublishDialog",
    renderDialog: (onCancel: () => void, open: boolean): JSX.Element => (
      <PublishDialog
        atlas={undefined}
        onCancel={onCancel}
        onPublished={(): void => undefined}
        open={open}
        pathParameter={TEST_PATH_PARAMETER}
      />
    ),
  },
  {
    confirmName: "Create Version",
    label: "CreateRevisionDialog",
    renderDialog: (onCancel: () => void, open: boolean): JSX.Element => (
      <CreateRevisionDialog
        atlas={undefined}
        onCancel={onCancel}
        open={open}
        pathParameter={TEST_PATH_PARAMETER}
      />
    ),
  },
];

describe.each(GUARDED_DIALOGS)(
  "$label mid-request guard",
  ({ confirmName, renderDialog }) => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    /**
     * Renders the dialog open, with an observable `onCancel`.
     * @returns the onCancel mock.
     */
    function renderGuarded(): jest.Mock {
      const onCancel = jest.fn();
      render(<Providers>{renderDialog(onCancel, true)}</Providers>);
      return onCancel;
    }

    /**
     * Starts the confirmed action and leaves the request in flight.
     * @returns resolve function for the pending response.
     */
    function confirmPending(): (response: Response) => void {
      const [pending, respond] = promiseWithResolvers<Response>();
      mockFetchResource.mockReturnValue(pending);
      act(() => {
        screen.getByRole("button", { name: confirmName }).click();
      });
      return respond;
    }

    it("shows a failure inline rather than on the app stack", async () => {
      // The stack sits below every modal and is marked `aria-hidden` while one
      // is open, behind a 90%-ink backdrop. A failure routed there would be
      // neither readable nor announced until the dialog closed — on an
      // irreversible action.
      mockFetchResource.mockResolvedValue(
        createMockResponse(403, { message: "Forbidden for this atlas" }),
      );
      renderGuarded();

      await act(async () => {
        screen.getByRole("button", { name: confirmName }).click();
      });

      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Forbidden for this atlas");
      expect(document.querySelector(".MuiDialog-paper")?.contains(alert)).toBe(
        true,
      );
      expect(document.querySelector(".MuiSnackbarContent-root")).toBeNull();
    });

    it("withholds every exit while the request is in flight", async () => {
      // Escape, the backdrop, Cancel and the title's "x" together. Each is a
      // separate line in the component, so each copy has to be checked.
      const onCancel = renderGuarded();
      expect(titleCloseButton()).toBeInTheDocument();

      const respond = confirmPending();

      expect(
        document.querySelector(".MuiDialogTitle-root .MuiIconButton-root"),
      ).toBeNull();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
      expect(screen.getByRole("button", { name: confirmName })).toBeDisabled();

      fireEvent.keyDown(screen.getByRole("dialog"), {
        code: "Escape",
        key: "Escape",
      });
      fireEvent.click(backdrop());
      expect(onCancel).not.toHaveBeenCalled();

      await act(async () => {
        respond(createMockResponse(403, { message: "Forbidden" }));
      });

      // And every exit is live again once it settles.
      expect(titleCloseButton()).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
      fireEvent.keyDown(screen.getByRole("dialog"), {
        code: "Escape",
        key: "Escape",
      });
      expect(onCancel).toHaveBeenCalled();
    });
  },
);

describe("confirmation dialog inline errors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows a failure inside the dialog rather than on the error stack", async () => {
    // The stack sits below every modal, outside the focus trap, and is
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
    // Every exit the dialog owns is withheld mid-request, so the user can no
    // longer be the one who closes it — but a close it doesn't control can,
    // and then the failure arrives after `onExited` has run and sets `error`
    // on a closed but still-mounted dialog. Without the enter clear, the next
    // confirmation for an irreversible action opens showing it.
    render(<Harness />);
    openDialog();
    const respond = publishPending();

    closeDialogExternally();
    await waitFor(() =>
      expect(document.querySelector(".MuiDialog-root")).toBeNull(),
    );
    await act(async () => {
      respond(createMockResponse(403, { message: "Forbidden for this atlas" }));
    });

    openDialog();

    expect(errorRegion()).toBeEmptyDOMElement();
  });

  it("ignores a failure from a session the user already closed and reopened", async () => {
    // The other ordering of the test above, and the one the enter/exited clears
    // can't reach: closed mid-request, reopened, and only *then* the first
    // request fails. Both clears have already run by the time the failure
    // lands, so without an attempt guard the dead confirmation's error is shown
    // against the live one — on an irreversible action.
    render(<Harness />);
    openDialog();
    const respond = publishPending();

    closeDialogExternally();
    await waitFor(() =>
      expect(document.querySelector(".MuiDialog-root")).toBeNull(),
    );
    openDialog();

    await act(async () => {
      respond(createMockResponse(403, { message: "Forbidden for this atlas" }));
    });

    expect(errorRegion()).toBeEmptyDOMElement();
  });

  it("withholds the title's close button while the request is in flight", async () => {
    // The last exit to be closed. Escape and the backdrop were already guarded
    // and Cancel already disabled, leaving the "x" as the one way out of a
    // confirmation for an irreversible action while it was still running — and
    // the path by which a failure could land against a dialog that had moved
    // on. findable-ui's `DialogTitle` renders the button only when `onClose` is
    // given and has no `disabled` prop, so withholding `onClose` is what the
    // guard looks like here: the button is absent rather than greyed out.
    render(<Harness />);
    openDialog();
    expect(titleCloseButton()).toBeInTheDocument();

    const respond = publishPending();

    expect(
      document.querySelector(".MuiDialogTitle-root .MuiIconButton-root"),
    ).toBeNull();

    // And back once the request settles, so the dialog is never left unclosable
    // after the fact.
    await act(async () => {
      respond(createMockResponse(403, { message: "Forbidden for this atlas" }));
    });

    expect(titleCloseButton()).toBeInTheDocument();
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
