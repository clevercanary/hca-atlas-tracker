import { Link } from "@clevercanary/data-explorer-ui/lib/components/Links/components/Link/link";
import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import Router from "next/router";
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
  getFormDiscardProps,
  getFormSaveProps,
} from "../TrackerForm/components/Banner/common/utils";
import { FormManagement } from "../TrackerForm/components/Banner/components/FormManagement/formManagement";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { AuthenticationRequired } from "../TrackerForm/components/Section/components/AuthenticationRequired/authenticationRequired";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceDataset/components/Add/components/GeneralInfo/generalInfo";
import { TrackerForm } from "../TrackerForm/trackerForm";

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
    formState: { isDirty },
    handleSubmit,
    onSubmit,
  } = formMethod;

  const onDiscard = useCallback(() => {
    Router.push(getRouteURL(ROUTE.VIEW_SOURCE_DATASETS, atlasId));
  }, [atlasId]);

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
      <FormManagement
        formDiscardProps={getFormDiscardProps(onDiscard)}
        formSaveProps={getFormSaveProps(formMethod, handleSubmit(onFormSubmit))}
        isDirty={isDirty}
      />
      <Divider />
      <GeneralInfo formMethod={formMethod} />
      <Divider />
    </TrackerForm>
  ) : (
    <AuthenticationRequired divider={<Divider />}>
      <Link label={"Sign in"} url={ROUTE.LOGIN} /> to add a new source dataset.
    </AuthenticationRequired>
  );
};
