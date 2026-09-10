import { useSnackbarState } from "@/app/components/common/Snackbar/provider/hook";
import { Portal } from "@mui/material";
import { type JSX } from "react";
import { SnackbarContent } from "./components/SnackbarContent/snackbarContent";
import { StyledStack } from "./errorSnackbar.styles";

/**
 * App-level error stack: one entry per error, each dismissed on its own.
 *
 * No `autoHideDuration`: an error stays until the user closes it, or until the
 * operation it reports on succeeds (see `useScopedRequest`).
 *
 * Portalled to `document.body` and never re-parented. It sits below
 * `zIndex.modal` and outside every dialog's focus trap, so an open modal covers
 * it and MUI marks it `aria-hidden` — the error is background until the modal
 * closes. Errors raised by an action inside a dialog therefore belong in that
 * dialog (see `useInlineRequest`), not here.
 *
 * The container is mounted unconditionally, empty stack included. MUI's
 * `ariaHiddenSiblings` snapshots `document.body.children` once, at modal
 * *mount*, so a container created after a dialog opened is never marked — an
 * error raised by a request that was already in flight would stay live in the
 * accessibility tree while painted behind the backdrop and outside the focus
 * trap. Always being a body child is what keeps the `aria-hidden` rule above
 * true in every ordering. An empty container intercepts nothing: it is
 * `pointer-events: none` and paints nothing of its own.
 * @returns error snackbar stack.
 */
export const ErrorSnackbar = (): JSX.Element => {
  const { entries } = useSnackbarState();

  return (
    <Portal>
      <StyledStack>
        {entries.map((entry) => (
          <SnackbarContent entry={entry} key={entry.id} />
        ))}
      </StyledStack>
    </Portal>
  );
};
