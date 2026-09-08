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
 * The container is mounted only while there are entries.
 * @returns error snackbar stack, or null while there is nothing to show.
 */
export const ErrorSnackbar = (): JSX.Element | null => {
  const { entries } = useSnackbarState();

  if (entries.length === 0) return null;

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
