import { SNACKBAR_SEVERITY } from "@/app/components/common/Snackbar/provider/constants";
import { useSnackbarState } from "@/app/components/common/Snackbar/provider/hook";
import { Portal } from "@mui/material";
import { type JSX, useState } from "react";
import { ErrorContent } from "./components/ErrorContent/errorContent";
import { SuccessAnnouncer } from "./components/SuccessAnnouncer/successAnnouncer";
import { SuccessContent } from "./components/SuccessContent/successContent";
import { StyledStack } from "./snackbarStack.styles";
import { getStackContainer, getSuccessEntries } from "./utils";

/**
 * App-level snackbar stack: one entry per error or confirmation, each
 * dismissed on its own.
 *
 * No `autoHideDuration` for an error: it stays until the user closes it, or
 * until the operation it reports on succeeds (see `useScopedRequest`). A
 * confirmation closes itself (see `SuccessContent`), and is announced by
 * `SuccessAnnouncer`, a status region that sits in the same container so the
 * `aria-hidden` rule below covers it too.
 *
 * Portalled to `document.body` and never re-parented. It sits below every Modal
 * the app opens and outside every dialog's focus trap, so an open modal covers
 * it and MUI marks it `aria-hidden` — an entry is background until the modal
 * closes. Errors raised by an action inside a dialog therefore belong in that
 * dialog (see `useInlineRequest`), not here.
 *
 * "Below every Modal" is `zIndex.drawer - 1`, not `zIndex.modal - 1`: MUI marks
 * siblings at modal-*mount* regardless of where that modal paints, so a Modal
 * painting lower than the stack would hide it from assistive tech while leaving
 * it visible and clickable. `Drawer` is that case — findable-ui's `RowDrawer`
 * is a `.MuiDrawer-modal` sitting at `zIndex.drawer` (1200). See
 * `snackbarStack.styles`.
 *
 * The container is mounted unconditionally, empty stack included, and is
 * created during render rather than by `Portal`'s own effect (see
 * `getStackContainer`). MUI's `ariaHiddenSiblings` snapshots
 * `document.body.children` once, at modal *mount*, so a container that appears
 * after a modal opened is never marked — an entry would stay live in the
 * accessibility tree while painted behind the modal and outside its focus
 * trap. Being a body child before any effect runs is what keeps the
 * `aria-hidden` rule above true in every ordering: an error raised by a
 * request already in flight, and a modal open in the same commit as the
 * provider. An empty container intercepts nothing: the styled list inside it is
 * `pointer-events: none` and paints nothing of its own.
 * @returns snackbar stack.
 */
export const SnackbarStack = (): JSX.Element => {
  const { entries } = useSnackbarState();
  // Lazy initializer, so the element is in `body` from the first render on.
  const [container] = useState(getStackContainer);

  return (
    <Portal container={container}>
      <SuccessAnnouncer entries={getSuccessEntries(entries)} />
      <StyledStack>
        {entries.map((entry) =>
          entry.severity === SNACKBAR_SEVERITY.SUCCESS ? (
            <SuccessContent entry={entry} key={entry.id} />
          ) : (
            <ErrorContent entry={entry} key={entry.id} />
          ),
        )}
      </StyledStack>
    </Portal>
  );
};
