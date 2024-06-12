import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { ButtonSecondary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonSecondary/buttonSecondary";
import { ReactNode } from "react";
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
        <ButtonSecondary onClick={onDiscard} size="small">
          Discard changes
        </ButtonSecondary>
        <ButtonPrimary onClick={onSave} size="small">
          Save changes
        </ButtonPrimary>
      </DialogActions>
    </Dialog>
  );
};
