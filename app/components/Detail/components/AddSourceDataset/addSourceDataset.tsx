import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { useCallback } from "react";
import { API } from "../../../../apis/catalog/hca-atlas-tracker/common/api";
import { AtlasId } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../../common/utils";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { NewSourceDatasetData } from "../../../../views/AddNewSourceDatasetView/common/entities";
import {
  onSuccess,
  unregisterSourceDatasetFields,
} from "../../../../views/AddNewSourceDatasetView/hooks/useAddSourceDatasetForm";
import {
  ButtonLink,
  BUTTON_COLOR,
} from "../../../common/Button/components/ButtonLink/buttonLink";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceDataset/components/Add/components/GeneralInfo/generalInfo";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { FormActions } from "../TrackerForm/trackerForm.styles";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface AddSourceDatasetProps {
  atlasId: AtlasId;
  formMethod: FormMethod<NewSourceDatasetData>;
}

export const AddSourceDataset = ({
  atlasId,
  formMethod,
}: AddSourceDatasetProps): JSX.Element => {
  const { disabled, handleSubmit, isAuthenticated, onSubmit, unregister } =
    formMethod;

  const onFormSubmit = useCallback(
    (payload: NewSourceDatasetData): void => {
      unregister(unregisterSourceDatasetFields(payload));
      onSubmit(
        getRequestURL(API.CREATE_ATLAS_SOURCE_DATASET, atlasId),
        METHOD.POST,
        payload,
        {
          onSuccess: (id) => onSuccess(atlasId, id),
        }
      );
    },
    [atlasId, onSubmit, unregister]
  );

  if (!isAuthenticated) return <RequestAccess />;

  return (
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
        <ButtonPrimary disabled={disabled} type="submit">
          Save
        </ButtonPrimary>
      </FormActions>
    </TrackerForm>
  );
};
