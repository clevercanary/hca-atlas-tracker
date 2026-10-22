import { CloseButton } from "@/app/components/common/Snackbar/components/SnackbarStack/components/CloseButton/closeButton";
import { EntryGrow } from "@/app/components/common/Snackbar/components/SnackbarStack/components/EntryGrow/entryGrow";
import { getMessageId } from "@/app/components/common/Snackbar/components/SnackbarStack/utils";
import { type JSX } from "react";
import { StyledSnackbarContent } from "./errorContent.styles";
import { type ErrorContentProps } from "./types";

/**
 * One error on the stack, dismissable on its own. `role="alert"`, MUI
 * `SnackbarContent`'s default.
 * @param props - Component props.
 * @param props.entry - The entry to render.
 * @returns one error entry of the snackbar stack.
 */
export const ErrorContent = ({ entry }: ErrorContentProps): JSX.Element => {
  return (
    <EntryGrow entry={entry}>
      <StyledSnackbarContent
        action={<CloseButton entryId={entry.id} label="Close error" />}
        message={<span id={getMessageId(entry.id)}>{entry.message}</span>}
      />
    </EntryGrow>
  );
};
