import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { ButtonSecondary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonSecondary/buttonSecondary";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
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
      <ButtonSecondary onClick={onDiscard} size={BUTTON_PROPS.SIZE.SMALL}>
        Discard
      </ButtonSecondary>
      <ButtonPrimary
        disabled={isDisabled}
        onClick={onSave}
        size={BUTTON_PROPS.SIZE.SMALL}
      >
        Link {count > 0 ? `(${count})` : null}
      </ButtonPrimary>
    </Actions>
  );
};
