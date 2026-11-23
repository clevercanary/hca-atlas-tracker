import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@/app/components/common/ConfirmationDialog/confirmationDialog.styles";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/constants";
import { BUTTON_PRESETS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/presets";
import { Button } from "@mui/material";
import { type JSX, type ReactNode } from "react";
import { PopupContent } from "./components/PopupContent/popupContent";

interface PopupProps extends FormManager {
  content?: ReactNode;
}

export const Popup = ({
  access,
  content,
  formAction,
  formStatus,
  getNextRoute,
}: PopupProps): JSX.Element => {
  const { canEdit } = access;
  const { onCancel, onDiscard, onSave } = formAction || {};
  const { isLeaving } = formStatus;
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={onCancel}
      open={canEdit && isLeaving}
    >
      <DialogTitle onClose={onCancel} title="Unsaved Changes" />
      <DialogContent dividers>
        {content ?? <PopupContent nextRoute={getNextRoute?.()} />}
      </DialogContent>
      <DialogActions>
        <Button
          {...BUTTON_PRESETS.SECONDARY_OUTLINED}
          onClick={onDiscard}
          size={BUTTON_PROPS.SIZE.SMALL}
        >
          Discard changes
        </Button>
        <Button
          {...BUTTON_PRESETS.PRIMARY_CONTAINED}
          onClick={onSave}
          size={BUTTON_PROPS.SIZE.SMALL}
        >
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
