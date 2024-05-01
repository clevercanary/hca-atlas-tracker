import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../../apis/catalog/hca-atlas-tracker/common/api";
import {
  AtlasId,
  HCAAtlasTrackerSourceDataset,
  SourceDatasetId,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../../common/utils";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { PUBLICATION_STATUS } from "../../../../views/AddNewSourceDatasetView/common/entities";
import { SourceDatasetEditData } from "../../../../views/EditSourceDatasetView/common/entities";
import {
  onSuccess,
  unregisterSourceDatasetFields,
} from "../../../../views/EditSourceDatasetView/hooks/useEditSourceDatasetForm";
import {
  getFormDiscardProps,
  getFormSaveProps,
} from "../TrackerForm/components/Banner/common/utils";
import { FormManagement } from "../TrackerForm/components/Banner/components/FormManagement/formManagement";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceDataset/components/Edit/components/GeneralInfo/generalInfo";
import { Identifiers } from "../TrackerForm/components/Section/components/SourceDataset/components/Edit/components/Identifiers/identifiers";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface EditSourceDatasetProps {
  atlasId: AtlasId;
  formMethod: FormMethod<SourceDatasetEditData, HCAAtlasTrackerSourceDataset>;
  sdId: SourceDatasetId;
  sdPublicationStatus: PUBLICATION_STATUS;
}

export const EditSourceDataset = ({
  atlasId,
  formMethod,
  sdId,
  sdPublicationStatus,
}: EditSourceDatasetProps): JSX.Element => {
  const {
    formState: { isDirty },
    handleSubmit,
    isAuthenticated,
    onSubmit,
    unregister,
  } = formMethod;

  const onDiscard = useCallback(() => {
    Router.push(getRouteURL(ROUTE.VIEW_SOURCE_DATASETS, atlasId));
  }, [atlasId]);

  const onFormSubmit = useCallback(
    (payload: SourceDatasetEditData): void => {
      unregister(unregisterSourceDatasetFields(payload));
      onSubmit(
        getRequestURL(API.ATLAS_SOURCE_DATASET, atlasId, sdId),
        METHOD.PUT,
        payload,
        {
          onSuccess: (id) => onSuccess(atlasId, id),
        }
      );
    },
    [atlasId, onSubmit, sdId, unregister]
  );

  if (!isAuthenticated) return <RequestAccess />;

  return (
    <TrackerForm>
      <FormManagement
        formDiscardProps={getFormDiscardProps(onDiscard)}
        formSaveProps={getFormSaveProps(formMethod, handleSubmit(onFormSubmit))} // TODO fix disable form save between published and unpublished states.
        isDirty={isDirty}
      />
      <Divider />
      <GeneralInfo
        formMethod={formMethod}
        sdPublicationStatus={sdPublicationStatus}
      />
      <Divider />
      <Identifiers formMethod={formMethod} />
      <Divider />
    </TrackerForm>
  );
};
