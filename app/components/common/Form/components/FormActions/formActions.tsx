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
    formAction: { onDiscard, onSave } = {},
    formStatus: { isDisabled },
  } = formManager;
  return (
    <Actions className={className}>
      <ButtonSecondary onClick={onDiscard} size="small">
        Discard
      </ButtonSecondary>
      <ButtonPrimary disabled={isDisabled} onClick={onSave} size="small">
        Save
      </ButtonPrimary>
    </Actions>
  );
};
