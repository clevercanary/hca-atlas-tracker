import { ButtonPrimary } from "@clevercanary/data-explorer-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { Link } from "@clevercanary/data-explorer-ui/lib/components/Links/components/Link/link";
import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback } from "react";
import { API } from "../../../../apis/catalog/hca-atlas-tracker/common/api";
import { NewAtlasData } from "../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { onSuccess } from "../../../../views/AddNewAtlasView/hooks/useAddAtlasForm";
import {
  ButtonLink,
  BUTTON_COLOR,
} from "../../../common/Button/components/ButtonLink/buttonLink";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { AuthenticationRequired } from "../TrackerForm/components/Section/components/Atlas/components/AuthenticationRequired/authenticationRequired";
import { GeneralInfo } from "../TrackerForm/components/Section/components/Atlas/components/GeneralInfo/generalInfo";
import { IntegrationLead } from "../TrackerForm/components/Section/components/Atlas/components/IntegrationLead/integrationLead";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { FormActions } from "../TrackerForm/trackerForm.styles";

interface AddAtlasProps {
  formMethod: FormMethod<NewAtlasData>;
}

export const AddAtlas = ({ formMethod }: AddAtlasProps): JSX.Element => {
  const { isAuthenticated } = useAuthentication();
  const { disabled, formState, handleSubmit, onSubmit } = formMethod;
  const { isDirty } = formState;

  const onFormSubmit = useCallback(
    (payload: NewAtlasData): void => {
      onSubmit(API.CREATE_ATLAS, METHOD.POST, payload, {
        onSuccess,
      });
    },
    [onSubmit]
  );

  return isAuthenticated ? (
    <TrackerForm onSubmit={handleSubmit(onFormSubmit)}>
      <Divider />
      <GeneralInfo {...formMethod} />
      <Divider />
      <IntegrationLead {...formMethod} />
      <Divider />
      <FormActions>
        <ButtonLink color={BUTTON_COLOR.SECONDARY} href={ROUTE.ATLASES}>
          Discard
        </ButtonLink>
        <ButtonPrimary disabled={disabled || !isDirty} type="submit">
          Save
        </ButtonPrimary>
      </FormActions>
    </TrackerForm>
  ) : (
    <AuthenticationRequired divider={<Divider />}>
      <Link label={"Sign in"} url={ROUTE.LOGIN} /> to add a new atlas.
    </AuthenticationRequired>
  );
};
