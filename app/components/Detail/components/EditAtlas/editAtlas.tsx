import { ButtonPrimary } from "@clevercanary/data-explorer-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { Link } from "@clevercanary/data-explorer-ui/lib/components/Links/components/Link/link";
import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback } from "react";
import { API } from "../../../../apis/catalog/hca-atlas-tracker/common/api";
import { AtlasId } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { NewAtlasData } from "../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../common/entities";
import { getRequestURL } from "../../../../common/utils";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { onSuccess } from "../../../../views/EditAtlasView/hooks/useEditAtlasForm";
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
  atlasId: AtlasId;
  formMethod: FormMethod<NewAtlasData>;
}

export const EditAtlas = ({
  atlasId,
  formMethod,
}: EditAtlasProps): JSX.Element => {
  const { isAuthenticated } = useAuthentication();
  const { disabled, formState, handleSubmit, onSubmit } = formMethod;
  const { isDirty } = formState;

  const onFormSubmit = useCallback(
    (payload: NewAtlasData) => {
      onSubmit(getRequestURL(API.ATLAS, atlasId), METHOD.PUT, payload, {
        onSuccess,
      });
    },
    [atlasId, onSubmit]
  );

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
