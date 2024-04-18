import { Link } from "@clevercanary/data-explorer-ui/lib/components/Links/components/Link/link";
import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../../apis/catalog/hca-atlas-tracker/common/api";
import {
  AtlasId,
  HCAAtlasTrackerAtlas,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasEditData } from "../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../common/entities";
import { getRequestURL } from "../../../../common/utils";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { onSuccess } from "../../../../views/EditAtlasView/hooks/useEditAtlasForm";
import {
  getFormDiscardProps,
  getFormSaveProps,
} from "../TrackerForm/components/Banner/common/utils";
import { FormManagement } from "../TrackerForm/components/Banner/components/FormManagement/formManagement";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/Atlas/components/GeneralInfo/generalInfo";
import { IntegrationLead } from "../TrackerForm/components/Section/components/Atlas/components/IntegrationLead/integrationLead";
import { AuthenticationRequired } from "../TrackerForm/components/Section/components/AuthenticationRequired/authenticationRequired";
import { TrackerForm } from "../TrackerForm/trackerForm";

interface EditAtlasProps {
  atlasId: AtlasId;
  formMethod: FormMethod<AtlasEditData, HCAAtlasTrackerAtlas>;
}

export const EditAtlas = ({
  atlasId,
  formMethod,
}: EditAtlasProps): JSX.Element => {
  const { isAuthenticated } = useAuthentication();
  const { formState, handleSubmit, onSubmit } = formMethod;
  const { isDirty } = formState;

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

  return isAuthenticated ? (
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
  ) : (
    <AuthenticationRequired>
      <Link label={"Sign in"} url={ROUTE.LOGIN} /> to edit an atlas.
    </AuthenticationRequired>
  );
};
