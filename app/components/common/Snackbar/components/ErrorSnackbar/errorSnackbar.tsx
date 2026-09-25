import { useSnackbarState } from "@/app/components/common/Snackbar/provider/hook";
import { Portal } from "@mui/material";
import { type JSX, useState } from "react";
import { SnackbarContent } from "./components/SnackbarContent/snackbarContent";
import { StyledStack } from "./errorSnackbar.styles";
import { getStackContainer } from "./utils";

/**
 * App-level error stack: one entry per error, each dismissed on its own.
 *
 * No `autoHideDuration`: an error stays until the user closes it, or until the
 * operation it reports on succeeds (see `useScopedRequest`).
 *
 * Portalled to `document.body` and never re-parented. It sits below every Modal
 * the app opens and outside every dialog's focus trap, so an open modal covers
 * it and MUI marks it `aria-hidden` — the error is background until the modal
 * closes. Errors raised by an action inside a dialog therefore belong in that
 * dialog (see `useInlineRequest`), not here.
 *
 * "Below every Modal" is `zIndex.drawer - 1`, not `zIndex.modal - 1`: MUI marks
 * siblings at modal-*mount* regardless of where that modal paints, so a Modal
 * painting lower than the stack would hide it from assistive tech while leaving
 * it visible and clickable. `Drawer` is that case — findable-ui's `RowDrawer`
 * is a `.MuiDrawer-modal` sitting at `zIndex.drawer` (1200). See
 * `errorSnackbar.styles`.
 *
 * The container is mounted unconditionally, empty stack included, and is
 * created during render rather than by `Portal`'s own effect (see
 * `getStackContainer`). MUI's `ariaHiddenSiblings` snapshots
 * `document.body.children` once, at modal *mount*, so a container that appears
 * after a modal opened is never marked — the error would stay live in the
 * accessibility tree while painted behind the modal and outside its focus
 * trap. Being a body child before any effect runs is what keeps the
 * `aria-hidden` rule above true in every ordering: an error raised by a
 * request already in flight, and a modal open in the same commit as the
 * provider. An empty container intercepts nothing: the styled list inside it is
 * `pointer-events: none` and paints nothing of its own.
 * @returns error snackbar stack.
 */
export const ErrorSnackbar = (): JSX.Element => {
  const { entries } = useSnackbarState();
  // Lazy initializer, so the element is in `body` from the first render on.
  const [container] = useState(getStackContainer);

  return (
    <Portal container={container}>
      <StyledStack>
        {entries.map((entry) => (
          <SnackbarContent entry={entry} key={entry.id} />
        ))}
      </StyledStack>
    </Portal>
  );
};
