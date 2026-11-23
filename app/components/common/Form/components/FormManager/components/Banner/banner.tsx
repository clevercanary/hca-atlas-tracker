import {
  FormActions,
  FormStatus,
} from "@/app/components/common/Form/components/FormManager/formManager.styles";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/constants";
import { BUTTON_PRESETS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/presets";
import { Button, Fade, Toolbar } from "@mui/material";
import { type JSX } from "react";
import { AppBar, ButtonOutline } from "./banner.styles";

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
            <ButtonOutline
              {...BUTTON_PRESETS.SECONDARY_OUTLINED}
              onClick={onDiscard}
              size={BUTTON_PROPS.SIZE.SMALL}
            >
              Discard
            </ButtonOutline>
            <Button
              {...BUTTON_PRESETS.PRIMARY_CONTAINED}
              disabled={isDisabled}
              onClick={onSave}
              size={BUTTON_PROPS.SIZE.SMALL}
            >
              Save
            </Button>
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
  formManager: Pick<FormManager, "access" | "formStatus">,
): boolean {
  const {
    access: { canEdit },
    formStatus: { isDirty, isLeaving },
  } = formManager;
  if (!canEdit) return false;
  return !isLeaving && isDirty;
}
