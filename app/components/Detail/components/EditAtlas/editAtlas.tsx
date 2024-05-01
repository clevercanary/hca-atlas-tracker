import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../../apis/catalog/hca-atlas-tracker/common/api";
import {
  AtlasId,
  HCAAtlasTrackerAtlas,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../common/entities";
import { getRequestURL } from "../../../../common/utils";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { AtlasEditData } from "../../../../views/EditAtlasView/common/entities";
import { onSuccess } from "../../../../views/EditAtlasView/hooks/useEditAtlasForm";
import {
  getFormDiscardProps,
  getFormSaveProps,
} from "../TrackerForm/components/Banner/common/utils";
import { FormManagement } from "../TrackerForm/components/Banner/components/FormManagement/formManagement";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/Atlas/components/GeneralInfo/generalInfo";
import { IntegrationLead } from "../TrackerForm/components/Section/components/Atlas/components/IntegrationLead/integrationLead";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface EditAtlasProps {
  atlasId: AtlasId;
  formMethod: FormMethod<AtlasEditData, HCAAtlasTrackerAtlas>;
}

export const EditAtlas = ({
  atlasId,
  formMethod,
}: EditAtlasProps): JSX.Element => {
  const {
    formState: { isDirty },
    handleSubmit,
    isAuthenticated,
    onSubmit,
  } = formMethod;

  const onDiscard = useCallback(() => {
    Router.push(ROUTE.ATLASES);
  }, []);

  const onFormSubmit = useCallback(
    (payload: AtlasEditData) => {
      onSubmit(getRequestURL(API.ATLAS, atlasId), METHOD.PUT, payload, {
        onSuccess,
      });
    },
    [atlasId, onSubmit]
  );

  if (!isAuthenticated) return <RequestAccess />;

  return (
    <TrackerForm>
      <FormManagement
        formDiscardProps={getFormDiscardProps(onDiscard)}
        formSaveProps={getFormSaveProps(formMethod, handleSubmit(onFormSubmit))}
        isDirty={isDirty}
      />
      <GeneralInfo formMethod={formMethod} />
      <Divider />
      <IntegrationLead formMethod={formMethod} />
      <Divider />
    </TrackerForm>
  );
};
