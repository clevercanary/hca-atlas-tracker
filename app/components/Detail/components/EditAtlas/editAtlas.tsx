import { ButtonPrimary } from "@clevercanary/data-explorer-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { Link } from "@clevercanary/data-explorer-ui/lib/components/Links/components/Link/link";
import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import { AtlasEditData } from "../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../routes/constants";
import {
  ButtonLink,
  BUTTON_COLOR,
} from "../../../common/Button/components/ButtonLink/buttonLink";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/Atlas/components/GeneralInfo/generalInfo";
import { IntegrationLead } from "../TrackerForm/components/Section/components/Atlas/components/IntegrationLead/integrationLead";
import { AuthenticationRequired } from "../TrackerForm/components/Section/components/AuthenticationRequired/authenticationRequired";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { FormActions } from "../TrackerForm/trackerForm.styles";

interface EditAtlasProps {
  formMethod: FormMethod<AtlasEditData>;
  onFormSubmit: (payload: AtlasEditData) => void;
}

export const EditAtlas = ({
  formMethod,
  onFormSubmit,
}: EditAtlasProps): JSX.Element => {
  const { isAuthenticated } = useAuthentication();
  const { disabled, formState, handleSubmit } = formMethod;
  const { isDirty } = formState;
  return isAuthenticated ? (
    <TrackerForm onSubmit={handleSubmit(onFormSubmit)}>
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
    <AuthenticationRequired>
      <Link label={"Sign in"} url={ROUTE.LOGIN} /> to edit an atlas.
    </AuthenticationRequired>
  );
};
