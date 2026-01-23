import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Button } from "@mui/material";
import { JSX, ReactNode } from "react";
import { FormManager } from "../../../../../../../hooks/useFormManager/common/entities";
import { PopupContent } from "./components/PopupContent/popupContent";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "./popup.styles";

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
          color={BUTTON_PROPS.COLOR.SECONDARY}
          onClick={onDiscard}
          size={BUTTON_PROPS.SIZE.SMALL}
          variant={BUTTON_PROPS.VARIANT.CONTAINED}
        >
          Discard changes
        </Button>
        <Button
          color={BUTTON_PROPS.COLOR.PRIMARY}
          onClick={onSave}
          size={BUTTON_PROPS.SIZE.SMALL}
          variant={BUTTON_PROPS.VARIANT.CONTAINED}
        >
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
