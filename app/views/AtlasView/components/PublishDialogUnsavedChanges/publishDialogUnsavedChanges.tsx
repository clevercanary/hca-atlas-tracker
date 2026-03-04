import { JSX } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../../components/common/ConfirmationDialog/confirmationDialog.styles";

interface Props {
  onCancel: () => void;
  open: boolean;
}

export const PublishDialogUnsavedChanges = ({
  onCancel,
  open,
}: Props): JSX.Element => {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={onCancel} open={open}>
      <DialogTitle onClose={onCancel} title="Unsaved Changes" />
      <DialogContent dividers>
        You have unsaved changes. Please save or discard them before publishing.
      </DialogContent>
    </Dialog>
  );
};
