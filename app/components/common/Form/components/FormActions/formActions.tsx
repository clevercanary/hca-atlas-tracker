import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/constants";
import { BUTTON_PRESETS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/presets";
import { Button } from "@mui/material";
import { type JSX } from "react";
import { FORM_ACTION_CLASS_NAME } from "./constants";
import { Actions } from "./formActions.styles";

export interface FormActionsProps {
  className?: string;
  formManager: FormManager;
}

export const FormActions = ({
  className,
  formManager,
}: FormActionsProps): JSX.Element => {
  const {
    formAction: { onDelete, onDiscard, onSave } = {},
    formStatus: { isDisabled },
  } = formManager;
  return (
    <Actions className={className}>
      {onDelete && (
        <Button
          className={FORM_ACTION_CLASS_NAME.DELETE}
          color={BUTTON_PROPS.COLOR.ERROR}
          onClick={onDelete}
          size={BUTTON_PROPS.SIZE.SMALL}
          variant={BUTTON_PROPS.VARIANT.CONTAINED}
        >
          Delete
        </Button>
      )}
      <Button
        {...BUTTON_PRESETS.SECONDARY_OUTLINED}
        className={FORM_ACTION_CLASS_NAME.DISCARD}
        onClick={onDiscard}
        size={BUTTON_PROPS.SIZE.SMALL}
      >
        Discard
      </Button>
      <Button
        {...BUTTON_PRESETS.PRIMARY_CONTAINED}
        className={FORM_ACTION_CLASS_NAME.SAVE}
        disabled={isDisabled}
        onClick={onSave}
        size={BUTTON_PROPS.SIZE.SMALL}
      >
        Save
      </Button>
    </Actions>
  );
};
