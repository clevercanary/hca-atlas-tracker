import { Button } from "@databiosphere/findable-ui/lib/components/common/Button/button";
import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { ButtonSecondary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonSecondary/buttonSecondary";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
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
      <ButtonSecondary onClick={onDiscard} size={BUTTON_PROPS.SIZE.SMALL}>
        Discard
      </ButtonSecondary>
      <ButtonPrimary
        disabled={isDisabled}
        onClick={onSave}
        size={BUTTON_PROPS.SIZE.SMALL}
      >
        Save
      </ButtonPrimary>
    </Actions>
  );
};
