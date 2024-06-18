import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { ButtonSecondary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonSecondary/buttonSecondary";
import { FormActionsProps as CommonFormActionProps } from "../../../../../../../../../common/Form/components/FormActions/formActions";
import { Actions } from "../../../../../../../../../common/Form/components/FormActions/formActions.styles";

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
      <ButtonSecondary onClick={onDiscard} size="small">
        Discard
      </ButtonSecondary>
      <ButtonPrimary disabled={isDisabled} onClick={onSave} size="small">
        Link {count > 0 ? `(${count})` : null}
      </ButtonPrimary>
    </Actions>
  );
};
