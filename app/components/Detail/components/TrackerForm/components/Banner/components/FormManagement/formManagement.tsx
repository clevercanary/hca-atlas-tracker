import { ButtonProps } from "@clevercanary/data-explorer-ui/lib/components/common/Button/button";
import { ButtonOutline } from "@clevercanary/data-explorer-ui/lib/components/common/Button/components/ButtonOutline/buttonOutline";
import { ButtonPrimary } from "@clevercanary/data-explorer-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { Fade } from "@mui/material";
import { Banner } from "../../banner";
import { FormActions, FormStatus } from "./formManagement.styles";

interface FormManagementProps {
  formDiscardProps: Partial<ButtonProps>;
  formSaveProps: Partial<ButtonProps>;
  isDirty: boolean;
  isIn?: boolean;
}

export const FormManagement = ({
  formDiscardProps,
  formSaveProps,
  isDirty,
  isIn = true,
}: FormManagementProps): JSX.Element => {
  return (
    <Banner isIn={isIn}>
      <Fade appear={false} in={isDirty} unmountOnExit>
        <FormStatus>Unsaved Changes</FormStatus>
      </Fade>
      <FormActions>
        <ButtonOutline {...formDiscardProps}>Discard</ButtonOutline>
        <ButtonPrimary {...formSaveProps}>Save</ButtonPrimary>
      </FormActions>
    </Banner>
  );
};
