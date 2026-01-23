import { JSX } from "react";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Button } from "@mui/material";
import { FormManager } from "../../../../../hooks/useFormManager/common/entities";
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
          color={BUTTON_PROPS.COLOR.ERROR}
          onClick={onDelete}
          size={BUTTON_PROPS.SIZE.SMALL}
          variant={BUTTON_PROPS.VARIANT.CONTAINED}
        >
          Delete
        </Button>
      )}
      <Button
        color={BUTTON_PROPS.COLOR.SECONDARY}
        onClick={onDiscard}
        size={BUTTON_PROPS.SIZE.SMALL}
        variant={BUTTON_PROPS.VARIANT.CONTAINED}
      >
        Discard
      </Button>
      <Button
        color={BUTTON_PROPS.COLOR.PRIMARY}
        disabled={isDisabled}
        onClick={onSave}
        size={BUTTON_PROPS.SIZE.SMALL}
        variant={BUTTON_PROPS.VARIANT.CONTAINED}
      >
        Save
      </Button>
    </Actions>
  );
};
