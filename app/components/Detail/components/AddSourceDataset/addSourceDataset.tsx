import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback } from "react";
import { API } from "../../../../apis/catalog/hca-atlas-tracker/common/api";
import { AtlasId } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { NewSourceDatasetData } from "../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../../common/utils";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { onSuccess } from "../../../../views/AddNewSourceDatasetView/hooks/useAddSourceDatasetForm";
import {
  ButtonLink,
  BUTTON_COLOR,
} from "../../../common/Button/components/ButtonLink/buttonLink";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { AuthenticationRequired } from "../TrackerForm/components/Section/components/AuthenticationRequired/authenticationRequired";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceDataset/components/Add/components/GeneralInfo/generalInfo";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { FormActions } from "../TrackerForm/trackerForm.styles";

interface AddSourceDatasetProps {
  atlasId: AtlasId;
  formMethod: FormMethod<NewSourceDatasetData>;
}

export const AddSourceDataset = ({
  atlasId,
  formMethod,
}: AddSourceDatasetProps): JSX.Element => {
  const { isAuthenticated } = useAuthentication();
  const {
    disabled,
    formState: { isDirty },
    handleSubmit,
    onSubmit,
  } = formMethod;

  const onFormSubmit = useCallback(
    (payload: NewSourceDatasetData): void => {
      onSubmit(
        getRequestURL(API.CREATE_ATLAS_SOURCE_DATASET, atlasId),
        METHOD.POST,
        payload,
        {
          onSuccess: (id) => onSuccess(atlasId, id),
        }
      );
    },
    [atlasId, onSubmit]
  );

  return isAuthenticated ? (
    <TrackerForm onSubmit={handleSubmit(onFormSubmit)}>
      <Divider />
      <GeneralInfo formMethod={formMethod} />
      <Divider />
      <FormActions>
        <ButtonLink
          color={BUTTON_COLOR.SECONDARY}
          href={getRouteURL(ROUTE.VIEW_SOURCE_DATASETS, atlasId)}
        >
          Discard
        </ButtonLink>
        <ButtonPrimary disabled={disabled || !isDirty} type="submit">
          Save
        </ButtonPrimary>
      </FormActions>
    </TrackerForm>
  ) : (
    <AuthenticationRequired divider={<Divider />}>
      <Link label={"Sign in"} url={ROUTE.LOGIN} /> to add a new source dataset.
    </AuthenticationRequired>
  );
};
