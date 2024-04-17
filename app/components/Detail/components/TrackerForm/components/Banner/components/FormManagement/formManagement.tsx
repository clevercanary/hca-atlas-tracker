import { ButtonOutline } from "@clevercanary/data-explorer-ui/lib/components/common/Button/components/ButtonOutline/buttonOutline";
import { ButtonPrimary } from "@clevercanary/data-explorer-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { Fade } from "@mui/material";
import { Fragment } from "react";
import { FormActions, FormStatus } from "./formManagement.styles";

interface FormManagementProps {
  isDirty: boolean;
  isDisabled: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

export const FormManagement = ({
  isDirty,
  isDisabled,
  onDiscard,
  onSave,
}: FormManagementProps): JSX.Element => {
  return (
    <Fragment>
      <Fade appear={false} in={isDirty}>
        <FormStatus>Unsaved Changes</FormStatus>
      </Fade>
      <FormActions>
        <ButtonOutline onClick={onDiscard}>Discard</ButtonOutline>
        <ButtonPrimary disabled={isDisabled || !isDirty} onClick={onSave}>
          Save
        </ButtonPrimary>
      </FormActions>
    </Fragment>
  );
};
