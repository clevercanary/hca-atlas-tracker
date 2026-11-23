import { FORM_ACTION_CLASS_NAME } from "@/app/components/common/Form/components/FormActions/constants";
import { type FormActionsProps as CommonFormActionProps } from "@/app/components/common/Form/components/FormActions/formActions";
import { Actions } from "@/app/components/common/Form/components/FormActions/formActions.styles";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/constants";
import { BUTTON_PRESETS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/presets";
import { Button } from "@mui/material";
import { type JSX } from "react";

interface FormActionsProps extends CommonFormActionProps {
  count: number;
}

export const FormActions = ({
  count,
  formManager,
}: FormActionsProps): JSX.Element => {
  const {
    formAction: { onDiscard, onSave } = {},
    formStatus: { isDisabled },
  } = formManager;
  return (
    <Actions>
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
        Link {count > 0 ? `(${count})` : null}
      </Button>
    </Actions>
  );
};
