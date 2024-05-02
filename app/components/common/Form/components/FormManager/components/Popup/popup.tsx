import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { ButtonSecondary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonSecondary/buttonSecondary";
import { FormManager } from "../../../../../../../hooks/useFormManager/common/entities";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "./popup.styles";

export const Popup = ({
  isLeaving,
  onCancel,
  onDiscard,
  onSave,
}: FormManager): JSX.Element => {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={onCancel} open={isLeaving}>
      <DialogTitle onClose={onCancel} title="Unsaved Changes" />
      <DialogContent dividers>
        You have unsaved changes in the &quot;Overview&quot; tab. Please save
        your changes before moving to the &quot;Source Datasets&quot; tab.
      </DialogContent>
      <DialogActions>
        <ButtonSecondary onClick={onDiscard}>Discard changes</ButtonSecondary>
        <ButtonPrimary onClick={onSave}>Save changes</ButtonPrimary>
      </DialogActions>
    </Dialog>
  );
};
