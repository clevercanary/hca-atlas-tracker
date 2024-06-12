import { ButtonOutline } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonOutline/buttonOutline";
import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { Fade, Toolbar } from "@mui/material";
import { FormManager } from "../../../../../../../hooks/useFormManager/common/entities";
import { FormActions, FormStatus } from "../../formManager.styles";
import { AppBar } from "./banner.styles";

export const Banner = ({
  access,
  formAction,
  formStatus,
}: FormManager): JSX.Element => {
  const { onDiscard, onSave } = formAction || {};
  const { isDisabled } = formStatus;
  return (
    <Fade
      appear={false}
      in={shouldRenderBanner({ access, formStatus })}
      unmountOnExit
    >
      <AppBar component="div" position="fixed">
        <Toolbar>
          <FormStatus>Unsaved Changes</FormStatus>
          <FormActions>
            <ButtonOutline onClick={onDiscard} size="small">
              Discard
            </ButtonOutline>
            <ButtonPrimary disabled={isDisabled} onClick={onSave} size="small">
              Save
            </ButtonPrimary>
          </FormActions>
        </Toolbar>
      </AppBar>
    </Fade>
  );
};

/**
 * The banner should be rendered if:
 * - the user has edit access to the form and,
 * - the user is not in the process of leaving the form while,
 * - the form is dirty.
 * @param formManager - Form manager.
 * @returns true if the banner should be rendered.
 */
function shouldRenderBanner(
  formManager: Pick<FormManager, "access" | "formStatus">
): boolean {
  const {
    access: { canEdit },
    formStatus: { isDirty, isLeaving },
  } = formManager;
  if (!canEdit) return false;
  return !isLeaving && isDirty;
}
