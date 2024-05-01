import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { useCallback } from "react";
import { API } from "../../../../apis/catalog/hca-atlas-tracker/common/api";
import { METHOD } from "../../../../common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { NewAtlasData } from "../../../../views/AddNewAtlasView/common/entities";
import { onSuccess } from "../../../../views/AddNewAtlasView/hooks/useAddAtlasForm";
import {
  ButtonLink,
  BUTTON_COLOR,
} from "../../../common/Button/components/ButtonLink/buttonLink";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/Atlas/components/GeneralInfo/generalInfo";
import { IntegrationLead } from "../TrackerForm/components/Section/components/Atlas/components/IntegrationLead/integrationLead";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { FormActions } from "../TrackerForm/trackerForm.styles";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface AddAtlasProps {
  formMethod: FormMethod<NewAtlasData>;
}

export const AddAtlas = ({ formMethod }: AddAtlasProps): JSX.Element => {
  const { disabled, formState, handleSubmit, isAuthenticated, onSubmit } =
    formMethod;
  const { isDirty } = formState;

  const onFormSubmit = useCallback(
    (payload: NewAtlasData): void => {
      onSubmit(API.CREATE_ATLAS, METHOD.POST, payload, {
        onSuccess,
      });
    },
    [onSubmit]
  );

  if (!isAuthenticated) return <RequestAccess />;

  return (
    <TrackerForm onSubmit={handleSubmit(onFormSubmit)}>
      <Divider />
      <GeneralInfo formMethod={formMethod} />
      <Divider />
      <IntegrationLead formMethod={formMethod} />
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
  );
};
