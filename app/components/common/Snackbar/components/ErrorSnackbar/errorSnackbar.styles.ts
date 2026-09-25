import { Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

/*
 * The container is transparent to the pointer, and each entry takes its own
 * clicks back (see `snackbarContent.styles`). Without that, the container's
 * padding and the gaps between entries intercept clicks aimed at whatever is
 * beneath — and at `zIndex.drawer - 1` (above the app bar) that's the header's
 * own controls, which sit in this same corner.
 *
 * The cost is the scrollbar of an overflowing stack: it belongs to this
 * container, so it can't be dragged. Wheeling over an entry still scrolls,
 * since the event bubbles from the entry to this scroll container.
 *
 * The z-index is below the *lowest* Modal in the app rather than below
 * `zIndex.modal`. MUI marks siblings `aria-hidden` at modal-mount wherever that
 * modal happens to paint, so the "covered, therefore honestly hidden" rule in
 * `errorSnackbar` holds only beneath the lowest of them — `Drawer`, at
 * `zIndex.drawer`, since findable-ui's `RowDrawer` is a `.MuiDrawer-modal`.
 * Nothing occupies the band between the two, and this still clears
 * `zIndex.appBar`, which the pointer note above depends on.
 */
export const StyledStack = styled(Stack)`
  align-items: flex-end;
  box-sizing: border-box;
  gap: 8px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 8px;
  pointer-events: none;
  position: fixed;
  right: 16px;
  top: 16px;
  z-index: ${({ theme }) => theme.zIndex.drawer - 1};
`;
