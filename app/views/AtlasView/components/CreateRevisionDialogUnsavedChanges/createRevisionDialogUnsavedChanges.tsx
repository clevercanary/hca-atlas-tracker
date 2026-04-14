import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Button } from "@mui/material";
import { JSX } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../../components/common/ConfirmationDialog/confirmationDialog.styles";

interface Props {
  onClose: () => void;
  open: boolean;
}

export const CreateRevisionDialogUnsavedChanges = ({
  onClose,
  open,
}: Props): JSX.Element => {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={onClose} open={open}>
      <DialogTitle onClose={onClose} title="Unsaved Changes" />
      <DialogContent dividers>
        You have unsaved changes. Please save or discard them before creating a
        new atlas version.
      </DialogContent>
      <DialogActions>
        <Button
          color={BUTTON_PROPS.COLOR.PRIMARY}
          onClick={onClose}
          size={BUTTON_PROPS.SIZE.SMALL}
          variant={BUTTON_PROPS.VARIANT.CONTAINED}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
