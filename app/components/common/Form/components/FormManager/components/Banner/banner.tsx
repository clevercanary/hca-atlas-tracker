import { ButtonOutline } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonOutline/buttonOutline";
import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { Fade, Toolbar } from "@mui/material";
import { FormManager } from "../../../../../../../hooks/useFormManager/common/entities";
import { FormActions, FormStatus } from "../../formManager.styles";
import { AppBar } from "./banner.styles";

export const Banner = ({
  formAction,
  formStatus,
}: FormManager): JSX.Element => {
  const { onDiscard, onSave } = formAction || {};
  const { isDirty, isDisabled, isLeaving, isSubmitted, isSubmitting } =
    formStatus;
  return (
    <Fade
      appear={false}
      in={(isDirty || isSubmitting || isSubmitted) && !isLeaving}
      unmountOnExit
    >
      <AppBar component="div" position="fixed">
        <Toolbar>
          <FormStatus>Unsaved Changes</FormStatus>
          <FormActions>
            <ButtonOutline onClick={onDiscard}>Discard</ButtonOutline>
            <ButtonPrimary disabled={isDisabled} onClick={onSave}>
              Save
            </ButtonPrimary>
          </FormActions>
        </Toolbar>
      </AppBar>
    </Fade>
  );
};
