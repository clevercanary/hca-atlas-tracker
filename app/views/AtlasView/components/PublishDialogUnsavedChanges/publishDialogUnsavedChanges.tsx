import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@/app/components/common/ConfirmationDialog/confirmationDialog.styles";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/constants";
import { BUTTON_PRESETS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/presets";
import { Button } from "@mui/material";
import { type JSX } from "react";

interface Props {
  onClose: () => void;
  open: boolean;
}

export const PublishDialogUnsavedChanges = ({
  onClose,
  open,
}: Props): JSX.Element => {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={onClose} open={open}>
      <DialogTitle onClose={onClose} title="Unsaved Changes" />
      <DialogContent dividers>
        You have unsaved changes. Please save or discard them before publishing.
      </DialogContent>
      <DialogActions>
        <Button
          {...BUTTON_PRESETS.PRIMARY_CONTAINED}
          onClick={onClose}
          size={BUTTON_PROPS.SIZE.SMALL}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
