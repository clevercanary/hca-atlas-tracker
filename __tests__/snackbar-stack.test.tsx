import { STACK_CONTAINER_ID } from "@/app/components/common/Snackbar/components/SnackbarStack/utils";
import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { SnackbarProvider } from "@/app/components/common/Snackbar/provider/provider";
import { actAsync } from "@/testing/snackbar";
import { createTheme, Dialog } from "@mui/material";
import "@testing-library/jest-dom";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { Fragment, type JSX, useEffect, useState } from "react";

const TEST_MESSAGE = "Failed to delete source study";
const TEST_SECOND_MESSAGE = "Failed to delete another source study";
const TEST_FOREIGN_MESSAGE = "Failed to archive file";
const TEST_SUCCESS_MESSAGE = "Unlinked dataset A from integrated object B";
const TEST_SECOND_SUCCESS_MESSAGE =
  "Unlinked dataset C from integrated object B";

// Stand-ins for what `getOperationKey` derives from a request. Two operations
// of the *same* feature (two atlases, two rows) is the case the key exists for,
// so the harness has to be able to raise both.
const TEST_OPERATION = "delete-source-study:study-a";
const TEST_SIBLING_OPERATION = "delete-source-study:study-b";
const TEST_FOREIGN_OPERATION = "archive:file-a";

/**
 * Raises errors on the app-level stack when clicked, standing in for failed
 * requests from two different features.
 * @returns buttons that open errors.
 */
function Opener(): JSX.Element {
  const { onDismissOperation, onOpen } = useSnackbar();
  return (
    <Fragment>
      <button
        data-testid="open-error"
        onClick={(): void => onOpen(TEST_MESSAGE, TEST_OPERATION)}
      >
        raise error
      </button>
      <button
        data-testid="open-second-error"
        onClick={(): void =>
          onOpen(TEST_SECOND_MESSAGE, TEST_SIBLING_OPERATION)
        }
      >
        raise a sibling operation&apos;s error, same feature
      </button>
      <button
        data-testid="open-other-message"
        onClick={(): void => onOpen(TEST_SECOND_MESSAGE, TEST_OPERATION)}
      >
        fail the same operation a different way
      </button>
      <button
        data-testid="open-foreign-error"
        onClick={(): void =>
          onOpen(TEST_FOREIGN_MESSAGE, TEST_FOREIGN_OPERATION)
        }
      >
        raise a foreign error
      </button>
      <button
        data-testid="dismiss-operation"
        onClick={(): void => onDismissOperation(TEST_SIBLING_OPERATION)}
      >
        succeed at the sibling operation
      </button>
    </Fragment>
  );
}

/**
 * Mounts the snackbar provider on its own, mirroring `_app`: the provider
 * outlives whatever raises errors into it.
 * @returns harness component.
 */
function StackHarness(): JSX.Element {
  return (
    <SnackbarProvider>
      <Opener />
    </SnackbarProvider>
  );
}

/**
 * Mounts the provider alongside a plain MUI dialog, standing in for any of the
 * app's dialogs — none of them re-parents the stack.
 * @returns harness component.
 */
function DialogHarness(): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <SnackbarProvider>
      <Opener />
      <button data-testid="open-dialog" onClick={(): void => setOpen(true)}>
        open
      </button>
      <button data-testid="close-dialog" onClick={(): void => setOpen(false)}>
        close
      </button>
      <Dialog open={open}>
        <div>an unrelated dialog</div>
      </Dialog>
    </SnackbarProvider>
  );
}

/**
 * The stack container, which is what MUI's ModalManager marks.
 *
 * Found as a direct child of `body` rather than through an entry: the container
 * is mounted whether or not there are entries, and being a body child from the
 * start is the property under test.
 * @returns stack container element.
 */
function stackContainer(): HTMLElement {
  const container = document.body.querySelector(
    `:scope > #${STACK_CONTAINER_ID}`,
  );
  // A runtime check rather than an assertion: if the structure ever changes,
  // this should say so rather than hand back a mistyped node.
  if (!(container instanceof HTMLElement))
    throw new Error("stack container not found");
  return container;
}

/**
 * The styled list inside the container: the element carrying the z-index and
 * pointer-events the tests below assert on.
 *
 * Separate from `stackContainer` because the two are different elements with
 * different jobs. The container is the plain body child a modal marks
 * `aria-hidden`; this is what is portalled into it. Asserting styles on the
 * container would pass vacuously — an unset `z-index` reads as `""`, which
 * `Number` turns into 0, satisfying any "below the modal" bound.
 * @returns the styled stack element.
 */
function stackList(): HTMLElement {
  const list = stackContainer().querySelector(".MuiStack-root");
  if (!(list instanceof HTMLElement)) throw new Error("stack list not found");
  return list;
}

/**
 * The messages currently on the stack, in DOM order.
 * @returns entry messages.
 */
function stackMessages(): string[] {
  return Array.from(
    document.querySelectorAll(".MuiSnackbarContent-message"),
  ).map((message) => (message.textContent ?? "").trim());
}

/**
 * The close button of the entry showing the given message, found by its
 * description rather than its name: the button is named "Close error" so the
 * message isn't announced twice inside the `role="alert"` subtree, and
 * described by the message so entries stay distinguishable.
 * @param message - Entry message.
 * @returns close button element.
 */
function closeButton(message: string): HTMLElement {
  return screen.getByRole("button", {
    description: message,
    name: "Close error",
  });
}

/**
 * Waits for the entries dismissed above to finish their exit transition and
 * leave the stack.
 *
 * The timeout is explicit and generous rather than `waitFor`'s 1s default:
 * removal is queued behind a ~195ms real timer, and running this suite
 * alongside the others under `--runInBand` starves that timer often enough
 * (about one run in eight, measured) to fail on a default deadline while the
 * transition is still pending.
 * @param messages - Expected messages once the removals have run.
 * @returns promise resolving once the stack matches.
 */
async function waitForStack(messages: string[]): Promise<void> {
  await waitFor(() => expect(stackMessages()).toEqual(messages), {
    timeout: 5000,
  });
}

/**
 * Clicks one of the harness buttons inside `act`.
 * @param testId - Test id of the button to click.
 * @returns void.
 */
function click(testId: string): void {
  act(() => {
    screen.getByTestId(testId).click();
  });
}

/**
 * Mounts the provider with a dialog already open and an error raised on mount,
 * so the modal and the stack container belong to the same first commit.
 * @returns harness component.
 */
function FirstCommitDialogHarness(): JSX.Element {
  return (
    <SnackbarProvider>
      <OpenOnMount />
    </SnackbarProvider>
  );
}

/**
 * Raises an error on mount and renders an already-open dialog.
 * @returns the dialog.
 */
function OpenOnMount(): JSX.Element {
  const { onOpen } = useSnackbar();
  useEffect(() => {
    onOpen("first commit failure", "first-commit-op");
  }, [onOpen]);
  return <Dialog open>dialog body</Dialog>;
}

/**
 * Raises confirmations on the app-level stack when clicked, alongside the error
 * harness so the two kinds of entry can be mixed.
 * @returns buttons that open confirmations.
 */
function SuccessOpener(): JSX.Element {
  const { onOpenSuccess } = useSnackbar();
  return (
    <Fragment>
      <button
        data-testid="open-success"
        onClick={(): void => onOpenSuccess(TEST_SUCCESS_MESSAGE)}
      >
        confirm
      </button>
      <button
        data-testid="open-second-success"
        onClick={(): void => onOpenSuccess(TEST_SECOND_SUCCESS_MESSAGE)}
      >
        confirm something else
      </button>
    </Fragment>
  );
}

/**
 * Mounts the provider with both the error and the success openers.
 * @returns harness component.
 */
function SuccessHarness(): JSX.Element {
  return (
    <SnackbarProvider>
      <Opener />
      <SuccessOpener />
    </SnackbarProvider>
  );
}

/**
 * The confirmations currently showing, in DOM order, read from the visible
 * `Alert`s rather than the status region.
 * @returns confirmation messages.
 */
function successMessages(): string[] {
  return Array.from(document.querySelectorAll(".MuiAlert-message")).map(
    (message) => (message.textContent ?? "").trim(),
  );
}

/**
 * The one visible confirmation, found by class rather than text: its message
 * also sits in the status region.
 * @returns the confirmation's alert element.
 */
function successAlert(): HTMLElement {
  const alert = document.querySelector(".MuiAlert-root");
  if (!(alert instanceof HTMLElement)) throw new Error("alert not found");
  return alert;
}

/**
 * The confirmation live region, which is what assistive tech announces.
 * @returns status region element.
 */
function statusRegion(): HTMLElement {
  return within(stackContainer()).getByRole("status");
}

/**
 * Advances the fake clock inside `act`, then flushes what that scheduled — a
 * close only schedules its exit transition once React has committed it, so the
 * exit needs a second pass to run.
 * @param ms - Milliseconds to advance.
 */
function advance(ms: number): void {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
  act(() => {
    jest.advanceTimersByTime(0);
  });
}

/**
 * Lets any exit transition already under way finish, without letting a pending
 * auto-hide run out: the exit is ~195ms, well under the 3s resume.
 */
function finishExit(): void {
  advance(1000);
}

describe("error snackbar stack", () => {
  it("keeps an unread error when a second one arrives", () => {
    // The defect the stack exists to remove. With one slot the second message
    // overwrote the first, and since there is no `autoHideDuration` the first
    // was destroyed unread rather than replaced after being seen.
    render(<StackHarness />);
    click("open-error");
    click("open-second-error");

    expect(stackMessages()).toEqual([TEST_MESSAGE, TEST_SECOND_MESSAGE]);
  });

  it("collapses a retry of the same failure into the entry already showing", () => {
    // A dialog stays open on failure, so retrying a persistently failing action
    // would otherwise leave one byte-identical entry per attempt, each needing
    // its own dismissal. The single slot had no such problem — a retry
    // overwrote the message — so this is a cost the stack introduces and has to
    // pay back.
    render(<StackHarness />);
    click("open-error");
    click("open-error");
    click("open-error");

    expect(stackMessages()).toEqual([TEST_MESSAGE]);
  });

  it("re-announces a repeat rather than silently leaving it in place", () => {
    // The other half of collapsing: if the entry were simply left alone, a
    // failed retry would be indistinguishable from no response at all — nothing
    // on screen changes and the alert is never spoken again. A fresh id remounts
    // the entry, which recreates the `role="alert"` node.
    render(<StackHarness />);
    click("open-error");
    const first = screen.getByRole("alert");

    click("open-error");

    expect(screen.getByRole("alert")).not.toBe(first);
  });

  it("replaces rather than stacks when one operation fails a second way", () => {
    // Matched on the operation, not the message: a retry that fails differently
    // ("Received 500" after "Forbidden") is that operation's latest word, not a
    // second error. Two entries for one operation would report one thing twice.
    render(<StackHarness />);
    click("open-error");

    click("open-other-message");

    expect(stackMessages()).toEqual([TEST_SECOND_MESSAGE]);
  });

  it("keeps a repeat where it is, rather than moving it to the end", () => {
    render(<StackHarness />);
    click("open-error");
    click("open-foreign-error");

    click("open-error");

    expect(stackMessages()).toEqual([TEST_MESSAGE, TEST_FOREIGN_MESSAGE]);
  });

  it("appends, so an entry the user is already reading does not move", () => {
    // Ordering is a readability guarantee, not an aesthetic one: prepending
    // would shift a message under the pointer of someone about to dismiss it.
    render(<StackHarness />);
    click("open-error");
    click("open-foreign-error");

    expect(stackMessages()).toEqual([TEST_MESSAGE, TEST_FOREIGN_MESSAGE]);
  });

  it("dismisses one entry and leaves the others", async () => {
    render(<StackHarness />);
    click("open-error");
    click("open-foreign-error");

    act(() => {
      closeButton(TEST_MESSAGE).click();
    });

    // Removal waits on the exit transition, so the entry is still in the DOM
    // for a moment — what matters is that the other one is never touched.
    await waitForStack([TEST_FOREIGN_MESSAGE]);
  });

  it("keeps the entry mounted through its exit transition", () => {
    // Regression guard for the `appear: false` defect (#1563 review), which
    // dropped the node synchronously on close and lost the fade on every toast
    // on every page. A still-mounted alert one commit after the click is what
    // distinguishes a transition from a synchronous removal.
    render(<StackHarness />);
    click("open-error");

    act(() => {
      closeButton(TEST_MESSAGE).click();
    });

    expect(screen.queryAllByRole("alert")).toHaveLength(1);
  });

  it("clears only the succeeding operation's entry, not a sibling's", async () => {
    // #1564. Both of these are the same feature under the same scope — two rows
    // of one table, two atlases behind one button — so a scope-keyed dismissal
    // took both. Keyed on the operation, a success on one leaves the other's
    // unread failure exactly where it was.
    render(<StackHarness />);
    click("open-error");
    click("open-second-error");
    click("open-foreign-error");

    click("dismiss-operation");

    await waitForStack([TEST_MESSAGE, TEST_FOREIGN_MESSAGE]);
  });

  it("leaves another feature's entry alone as well", async () => {
    // The cross-feature guarantee #1520/#1540 exist for. It used to be the
    // scope's job; it now falls out of the key, so it is asserted rather than
    // assumed to have survived the change.
    render(<StackHarness />);
    click("open-foreign-error");
    click("open-second-error");

    click("dismiss-operation");

    await waitForStack([TEST_FOREIGN_MESSAGE]);
  });

  it("keeps one container across an empty stack, so a modal can always mark it", async () => {
    // The container never unmounts: MUI's `ariaHiddenSiblings` snapshots
    // `document.body.children` at modal *mount*, so a container that comes and
    // goes with the entries can be absent from that snapshot and never marked.
    // One stable body child is what makes the `aria-hidden` rule hold in every
    // ordering — see the modal cases below.
    render(<StackHarness />);
    const first = stackContainer();
    expect(screen.queryAllByRole("alert")).toHaveLength(0);

    click("open-error");
    expect(stackContainer()).toBe(first);
    act(() => {
      closeButton(TEST_MESSAGE).click();
    });
    await waitForStack([]);

    click("open-error");
    expect(stackContainer()).toBe(first);
  });

  it("lets a modal cover the stack rather than fighting to stay announced", async () => {
    // The design rule: a modal opening over a pinned error covers it, and the
    // user reaches the error again by closing the modal. MUI's
    // `ariaHiddenSiblings` marks the stack `aria-hidden` at modal-mount, and
    // that is now *correct* — the stack really is behind the dialog and outside
    // its focus trap, so being hidden from assistive tech is consistent rather
    // than a defect.
    //
    // This is the inverse of what a `useAriaHiddenGuard` used to assert here.
    // What keeps the two consistent is the z-index, pinned separately below.
    render(<DialogHarness />);
    click("open-error");
    click("open-foreign-error");
    expect(screen.queryAllByRole("alert")).toHaveLength(2);

    click("open-dialog");
    await actAsync(async () => undefined);

    expect(stackContainer()).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("is marked even by a modal open in the provider's own first commit", async () => {
    // The container is created during render rather than by `Portal`'s effect,
    // and this is the ordering that distinguishes the two. Effects run
    // children-first and the provider renders `{children}` before
    // `SnackbarStack`, so with a modal open from the very first commit its
    // `ariaHiddenSiblings` snapshot runs before any effect of ours. A container
    // appended by `Portal`'s effect isn't in `document.body` yet at that point
    // and is never marked — leaving the error live in the accessibility tree
    // while painted behind the modal and outside its focus trap.
    render(<FirstCommitDialogHarness />);
    await actAsync(async () => undefined);

    // Queried from the document rather than through `stackContainer`, and
    // asserted as "sits inside a marked subtree" rather than on the container's
    // own attribute. Both deliberate: against a plain `<Portal>` the stack is
    // still found — appended straight to `body` — so this fails on the missing
    // `aria-hidden` ancestor, which is the property, rather than on a helper
    // not finding an element that no longer exists.
    const list = document.querySelector(".MuiStack-root");
    if (!(list instanceof HTMLElement)) throw new Error("stack list not found");

    expect(list.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("paints the stack below every modal, so hiding it from assistive tech is honest", () => {
    // The mark asserted above is only *correct* while the stack is genuinely
    // behind the modal. Raising it back to `zIndex.snackbar` (1400) would put
    // the two out of step — an error painted over the dialog for a sighted user
    // and silent for everyone else, which is the inconsistency the deleted
    // guard existed to paper over. Compared against MUI's own value rather than
    // a literal, so a MUI change moves the assertion with it.
    //
    // Bounded by `zIndex.drawer`, not `zIndex.modal`: MUI marks siblings at
    // modal-*mount* wherever that modal paints, and `Drawer` is a Modal that
    // paints at 1200 (findable-ui's `RowDrawer` is a `.MuiDrawer-modal`, used
    // by the tasks row preview). At `zIndex.modal - 1` the stack stayed visible
    // and clickable above an open drawer while being `aria-hidden` to everyone
    // else — the same sighted/AT split, one band lower.
    render(<StackHarness />);
    click("open-error");

    const zIndex = Number(getComputedStyle(stackList()).zIndex);
    expect(zIndex).toBeLessThan(createTheme().zIndex.drawer);
  });

  it("lets clicks through the container while the entries keep taking theirs", () => {
    // The container is fixed in the header's own corner and painted above the
    // app bar, so its padding and the gaps between entries would otherwise
    // intercept clicks aimed at the controls underneath. Only the cards are
    // targets; the container is transparent to the pointer.
    render(<StackHarness />);
    click("open-error");

    const entry = document.querySelector(".MuiSnackbarContent-root");
    if (!(entry instanceof HTMLElement)) throw new Error("entry not found");
    expect(getComputedStyle(stackList()).pointerEvents).toBe("none");
    expect(getComputedStyle(entry).pointerEvents).toBe("auto");
  });

  it("covers an error raised while the modal is already open", async () => {
    // The ordering the rule above does not cover, and the one that breaks it:
    // the request was already in flight when the dialog opened, so the stack
    // was empty and its container did not exist. MUI's `ariaHiddenSiblings`
    // snapshots `document.body.children` once, at modal *mount*, so a container
    // appended afterwards is never marked — the entry stays live in the a11y
    // tree while sitting behind the dialog's backdrop and outside
    // the focus trap: announced, but unreadable and unreachable.
    render(<DialogHarness />);
    click("open-dialog");
    await actAsync(async () => undefined);

    click("open-foreign-error");
    await actAsync(async () => undefined);

    expect(stackContainer()).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
  });

  it("hands the stack back once the modal closes", async () => {
    // The other half of the rule, and what makes covering the error acceptable:
    // nothing is lost by making the user wait, because the entries survive the
    // modal and are exposed again the moment it goes.
    render(<DialogHarness />);
    click("open-error");
    click("open-dialog");
    await actAsync(async () => undefined);
    expect(screen.queryAllByRole("alert")).toHaveLength(0);

    click("close-dialog");
    await actAsync(async () => undefined);

    expect(stackMessages()).toEqual([TEST_MESSAGE]);
  });

  it("leaves entries in place across a dialog opening and closing", async () => {
    // The single toast was re-parented into a claiming dialog and back, which
    // changed its portal container and remounted it — creating the
    // `role="alert"` node three times for one error, replaying the grow-in and
    // re-announcing the message each time. An entry that survives the same
    // sequence as the same element is what pins that this no longer happens.
    //
    // Queried through the DOM rather than by role: while the dialog is open the
    // stack is `aria-hidden`, so it is deliberately absent from the a11y tree.
    // The element is what's under test here, not its exposure.
    render(<DialogHarness />);
    click("open-error");
    const content = document.querySelector(".MuiSnackbarContent-root");
    expect(content).not.toBeNull();

    click("open-dialog");
    await actAsync(async () => undefined);
    expect(document.querySelector(".MuiSnackbarContent-root")).toBe(content);

    click("close-dialog");

    expect(document.querySelector(".MuiSnackbarContent-root")).toBe(content);
    expect(stackMessages()).toEqual([TEST_MESSAGE]);
  });

  it("keeps the stack outside the dialog", async () => {
    // Deliberate, and the reverse of what the single toast did. `.MuiModal-root`
    // is `position: fixed; z-index: 1300`, so it establishes a stacking context
    // — an entry inside it would have its own 1400 scoped to that dialog and a
    // later modal would paint over it — and an entry parented to a dialog's
    // Paper is destroyed when the dialog unmounts. The cost is that `FocusTrap`
    // enforces by DOM containment, so the close button is not reachable by Tab
    // while the dialog is open; see `SnackbarStack`.
    render(<DialogHarness />);
    click("open-error");
    click("open-dialog");
    await actAsync(async () => undefined);

    const dialogContainer = document.querySelector(".MuiDialog-container");
    expect(dialogContainer).not.toBeNull();
    expect(dialogContainer?.contains(stackContainer())).toBe(false);
    expect(stackContainer().parentElement).toBe(document.body);
  });
});

describe("success snackbar entries", () => {
  // Fake timers for the auto-hide countdown and the transitions alike.
  // `document.hasFocus()` is false in jsdom until something is focused, which
  // would hold every countdown as if the window were in the background.
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(document, "hasFocus").mockReturnValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("keeps the status region mounted and empty before anything is confirmed", () => {
    // A region that appears already holding its text is announced unreliably,
    // so it has to be in the tree before the first confirmation arrives.
    render(<SuccessHarness />);

    expect(statusRegion()).toBeEmptyDOMElement();
  });

  it("announces only what was added, not the whole region", () => {
    // `role="status"` implies `aria-atomic="true"`, which would have a second
    // confirmation re-read the first along with it.
    render(<SuccessHarness />);

    expect(statusRegion()).toHaveAttribute("aria-atomic", "false");
  });

  it("shows a confirmation and announces it through the region, not the alert", () => {
    render(<SuccessHarness />);
    click("open-success");

    expect(successMessages()).toEqual([TEST_SUCCESS_MESSAGE]);
    expect(statusRegion()).toHaveTextContent(TEST_SUCCESS_MESSAGE);
    // The visible alert carries no live role, so it isn't announced twice.
    expect(successAlert()).toHaveAttribute("role", "none");
    expect(within(stackContainer()).queryByRole("alert")).toBeNull();
  });

  it("closes itself after six seconds, and not before", () => {
    render(<SuccessHarness />);
    click("open-success");

    advance(5900);
    expect(successMessages()).toEqual([TEST_SUCCESS_MESSAGE]);

    advance(100);
    finishExit();
    expect(successMessages()).toEqual([]);
    expect(statusRegion()).toBeEmptyDOMElement();
  });

  it("closes on its close button", () => {
    render(<SuccessHarness />);
    click("open-success");

    act(() => {
      screen
        .getByRole("button", {
          description: TEST_SUCCESS_MESSAGE,
          name: "Close notification",
        })
        .click();
    });
    finishExit();

    expect(successMessages()).toEqual([]);
  });

  it("holds while hovered, then resumes with half the duration once left", () => {
    render(<SuccessHarness />);
    click("open-success");
    const alert = successAlert();

    fireEvent.mouseEnter(alert);
    advance(60000);
    expect(successMessages()).toEqual([TEST_SUCCESS_MESSAGE]);

    fireEvent.mouseLeave(alert);
    advance(2900);
    expect(successMessages()).toEqual([TEST_SUCCESS_MESSAGE]);

    advance(100);
    finishExit();
    expect(successMessages()).toEqual([]);
  });

  it("holds while focus is inside, even after the pointer has left", () => {
    // Tracked separately from the pointer, so the pointer leaving doesn't
    // restart the countdown out from under a keyboard user.
    render(<SuccessHarness />);
    click("open-success");
    const alert = successAlert();
    const close = screen.getByRole("button", { name: "Close notification" });

    fireEvent.mouseEnter(alert);
    act(() => close.focus());
    fireEvent.mouseLeave(alert);
    advance(60000);
    expect(successMessages()).toEqual([TEST_SUCCESS_MESSAGE]);

    act(() => close.blur());
    advance(2900);
    expect(successMessages()).toEqual([TEST_SUCCESS_MESSAGE]);

    advance(100);
    finishExit();
    expect(successMessages()).toEqual([]);
  });

  it("holds while the window is in the background", () => {
    render(<SuccessHarness />);
    click("open-success");

    advance(4000);
    act(() => {
      window.dispatchEvent(new Event("blur"));
    });
    advance(60000);
    expect(successMessages()).toEqual([TEST_SUCCESS_MESSAGE]);

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    advance(2900);
    expect(successMessages()).toEqual([TEST_SUCCESS_MESSAGE]);

    advance(100);
    finishExit();
    expect(successMessages()).toEqual([]);
  });

  it("holds from the start when it opens into a window in the background", () => {
    // The user switched away while a slow request ran; the confirmation should
    // still be there when they come back.
    jest.spyOn(document, "hasFocus").mockReturnValue(false);
    render(<SuccessHarness />);
    click("open-success");

    advance(60000);
    expect(successMessages()).toEqual([TEST_SUCCESS_MESSAGE]);

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    advance(3000);
    finishExit();
    expect(successMessages()).toEqual([]);
  });

  it("stacks a second confirmation rather than replacing the first", () => {
    render(<SuccessHarness />);
    click("open-success");
    click("open-second-success");

    expect(successMessages()).toEqual([
      TEST_SUCCESS_MESSAGE,
      TEST_SECOND_SUCCESS_MESSAGE,
    ]);
    expect(statusRegion()).toHaveTextContent(
      `${TEST_SUCCESS_MESSAGE}${TEST_SECOND_SUCCESS_MESSAGE}`,
    );
  });

  it("stacks a repeat of the same confirmation as an addition, so it is announced", () => {
    render(<SuccessHarness />);
    click("open-success");
    click("open-success");

    expect(successMessages()).toEqual([
      TEST_SUCCESS_MESSAGE,
      TEST_SUCCESS_MESSAGE,
    ]);
    expect(statusRegion().children).toHaveLength(2);
  });

  it("drops a closed confirmation from the region without touching the others", () => {
    // A removal isn't announced by a status region, so closing one never
    // re-reads the rest — unlike swapping the region's text back to an older
    // message would.
    render(<SuccessHarness />);
    click("open-success");
    click("open-second-success");
    const remaining = statusRegion().children[1];

    act(() => {
      screen
        .getByRole("button", {
          description: TEST_SUCCESS_MESSAGE,
          name: "Close notification",
        })
        .click();
    });
    finishExit();

    expect(statusRegion().children).toHaveLength(1);
    expect(statusRegion().children[0]).toBe(remaining);
    expect(statusRegion()).toHaveTextContent(TEST_SECOND_SUCCESS_MESSAGE);
  });

  it("is neither replaced by an error nor dismissed by an operation succeeding", () => {
    // A confirmation belongs to no operation, so the error stack's per-operation
    // folding and dismissal pass it by.
    render(<SuccessHarness />);
    click("open-success");
    click("open-error");
    click("open-second-error");
    // Closes the sibling operation's error, and only that.
    click("dismiss-operation");
    finishExit();

    expect(successMessages()).toEqual([TEST_SUCCESS_MESSAGE]);
    expect(stackMessages()).toEqual([TEST_MESSAGE]);
  });

  it("leaves errors in place when it closes itself", () => {
    // Errors never auto-hide; the confirmation's countdown is its own.
    render(<SuccessHarness />);
    click("open-error");
    click("open-success");

    advance(6000);
    finishExit();

    expect(successMessages()).toEqual([]);
    expect(stackMessages()).toEqual([TEST_MESSAGE]);
  });
});
