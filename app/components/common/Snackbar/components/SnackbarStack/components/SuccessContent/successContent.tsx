import { CloseButton } from "@/app/components/common/Snackbar/components/SnackbarStack/components/CloseButton/closeButton";
import { EntryGrow } from "@/app/components/common/Snackbar/components/SnackbarStack/components/EntryGrow/entryGrow";
import { getMessageId } from "@/app/components/common/Snackbar/components/SnackbarStack/utils";
import { SUCCESS_AUTO_HIDE_DURATION } from "@/app/components/common/Snackbar/provider/constants";
import { ALERT_PROPS } from "@databiosphere/findable-ui/lib/components/common/Alert/constants";
import { type JSX } from "react";
import { useAutoHide } from "./hooks/UseAutoHide/hook";
import { StyledAlert } from "./successContent.styles";
import { type SuccessContentProps } from "./types";

/**
 * One confirmation on the stack: a success `Alert` that closes itself after
 * `SUCCESS_AUTO_HIDE_DURATION`, unless it is being hovered or focused (see
 * `useAutoHide`), or on its close button.
 *
 * `role="none"`, replacing the `Alert` default of `alert`: a confirmation is
 * announced politely, by `SuccessAnnouncer`, because a live region that mounts
 * already holding its text is announced unreliably.
 * @param props - Component props.
 * @param props.entry - The entry to render.
 * @returns one success entry of the snackbar stack.
 */
export const SuccessContent = ({ entry }: SuccessContentProps): JSX.Element => {
  const autoHideProps = useAutoHide(entry.id, SUCCESS_AUTO_HIDE_DURATION);
  return (
    <EntryGrow entry={entry}>
      <StyledAlert
        {...ALERT_PROPS.STANDARD_SUCCESS}
        {...autoHideProps}
        action={<CloseButton entryId={entry.id} label="Close notification" />}
        role="none"
      >
        <span id={getMessageId(entry.id)}>{entry.message}</span>
      </StyledAlert>
    </EntryGrow>
  );
};
