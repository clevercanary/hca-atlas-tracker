import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { Grow, useTheme } from "@mui/material";
import { type JSX } from "react";
import { type EntryGrowProps } from "./types";

/**
 * Grows an entry in when it opens and out when it closes, then drops it from
 * the stack once the exit has run (see `onExited`).
 * @param props - Component props.
 * @param props.children - The entry's content; must hold a ref.
 * @param props.entry - The entry being shown.
 * @returns the entry's transition.
 */
export const EntryGrow = ({ children, entry }: EntryGrowProps): JSX.Element => {
  const { onExited } = useSnackbar();
  const { transitions } = useTheme();
  return (
    <Grow
      in={entry.open}
      onExited={(): void => onExited(entry.id)}
      timeout={{
        enter: transitions.duration.enteringScreen,
        exit: transitions.duration.leavingScreen,
      }}
    >
      {children}
    </Grow>
  );
};
