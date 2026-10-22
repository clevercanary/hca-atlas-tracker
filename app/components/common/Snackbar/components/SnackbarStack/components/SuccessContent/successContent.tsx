import { CloseButton } from "@/app/components/common/Snackbar/components/SnackbarStack/components/CloseButton/closeButton";
import { EntryGrow } from "@/app/components/common/Snackbar/components/SnackbarStack/components/EntryGrow/entryGrow";
import { getMessageId } from "@/app/components/common/Snackbar/components/SnackbarStack/utils";
import { SUCCESS_AUTO_HIDE_DURATION } from "@/app/components/common/Snackbar/provider/constants";
import { type JSX } from "react";
import { useAutoHide } from "./hooks/UseAutoHide/hook";
import { StyledSuccessContent } from "./successContent.styles";
import { type SuccessContentProps } from "./types";

/**
 * One confirmation on the stack: the same toast as an error, on the success
 * fill, that closes itself after `SUCCESS_AUTO_HIDE_DURATION` unless it is
 * being hovered or focused (see `useAutoHide`), or on its close button.
 *
 * `role="none"`, replacing `SnackbarContent`'s default of `alert`: a
 * confirmation is announced politely, by `SuccessAnnouncer`, because a live
 * region that mounts already holding its text is announced unreliably.
 * @param props - Component props.
 * @param props.entry - The entry to render.
 * @returns one success entry of the snackbar stack.
 */
export const SuccessContent = ({ entry }: SuccessContentProps): JSX.Element => {
  const autoHideProps = useAutoHide(entry.id, SUCCESS_AUTO_HIDE_DURATION);
  return (
    <EntryGrow entry={entry}>
      <StyledSuccessContent
        {...autoHideProps}
        action={<CloseButton entryId={entry.id} label="Close notification" />}
        message={<span id={getMessageId(entry.id)}>{entry.message}</span>}
        role="none"
      />
    </EntryGrow>
  );
};
