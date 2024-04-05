import { ButtonPrimary } from "@clevercanary/data-explorer-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { Link } from "@clevercanary/data-explorer-ui/lib/components/Links/components/Link/link";
import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback } from "react";
import { NewAtlasData } from "../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { ROUTE } from "../../../../constants/routes";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import {
  onSuccess,
  REQUEST_METHOD,
  REQUEST_URL,
} from "../../../../views/AddNewAtlasView/hooks/useAddAtlasForm";
import {
  ButtonLink,
  BUTTON_COLOR,
} from "../../../common/Button/components/ButtonLink/buttonLink";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { AuthenticationRequired } from "../TrackerForm/components/Section/components/AuthenticationRequired/authenticationRequired";
import { GeneralInfo } from "../TrackerForm/components/Section/components/GeneralInfo/generalInfo";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { FormActions } from "../TrackerForm/trackerForm.styles";

interface AddAtlasProps {
  formMethod: FormMethod<NewAtlasData>;
}

export const AddAtlas = ({ formMethod }: AddAtlasProps): JSX.Element => {
  const { isAuthenticated } = useAuthentication();
  const { disabled, handleSubmit, onSubmit } = formMethod;

  const onFormSubmit = useCallback(
    (payload: NewAtlasData): void => {
      onSubmit(REQUEST_URL, REQUEST_METHOD, payload, {
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
      <FormActions>
        <ButtonLink color={BUTTON_COLOR.SECONDARY} href={ROUTE.ATLASES}>
          Discard
        </ButtonLink>
        <ButtonPrimary disabled={disabled} type="submit">
          Save
        </ButtonPrimary>
      </FormActions>
    </TrackerForm>
  ) : (
    <AuthenticationRequired>
      <Link label={"Sign in"} url={ROUTE.LOGIN} /> to add a new atlas.
    </AuthenticationRequired>
  );
};
