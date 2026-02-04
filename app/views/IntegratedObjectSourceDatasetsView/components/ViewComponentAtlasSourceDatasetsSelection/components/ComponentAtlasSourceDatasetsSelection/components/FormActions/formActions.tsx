import { JSX } from "react";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Button } from "@mui/material";
import { FormActionsProps as CommonFormActionProps } from "../../../../../../../../components/common/Form/components/FormActions/formActions";
import { Actions } from "../../../../../../../../components/common/Form/components/FormActions/formActions.styles";

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
        Link {count > 0 ? `(${count})` : null}
      </Button>
    </Actions>
  );
};
