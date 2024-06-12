import { Button } from "@databiosphere/findable-ui/lib/components/common/Button/button";
import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { ButtonSecondary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonSecondary/buttonSecondary";
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
          color="error"
          onClick={onDelete}
          size="small"
          variant="contained"
        >
          Delete
        </Button>
      )}
      <ButtonSecondary onClick={onDiscard} size="small">
        Discard
      </ButtonSecondary>
      <ButtonPrimary disabled={isDisabled} onClick={onSave} size="small">
        Save
      </ButtonPrimary>
    </Actions>
  );
};
