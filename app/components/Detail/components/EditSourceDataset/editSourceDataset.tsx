import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import Router from "next/router";
import { useCallback } from "react";
import {
  AtlasId,
  HCAAtlasTrackerSourceDataset,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { SourceDatasetEditData } from "../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { getRouteURL } from "../../../../common/utils";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../routes/constants";
import {
  getFormDiscardProps,
  getFormSaveProps,
} from "../TrackerForm/components/Banner/common/utils";
import { FormManagement } from "../TrackerForm/components/Banner/components/FormManagement/formManagement";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { AuthenticationRequired } from "../TrackerForm/components/Section/components/AuthenticationRequired/authenticationRequired";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceDataset/components/Edit/components/GeneralInfo/generalInfo";
import { Identifiers } from "../TrackerForm/components/Section/components/SourceDataset/components/Edit/components/Identifiers/identifiers";
import { TrackerForm } from "../TrackerForm/trackerForm";

interface EditSourceDatasetProps {
  atlasId: AtlasId;
  formMethod: FormMethod<SourceDatasetEditData, HCAAtlasTrackerSourceDataset>;
}

export const EditSourceDataset = ({
  atlasId,
  formMethod,
}: EditSourceDatasetProps): JSX.Element => {
  const { isAuthenticated } = useAuthentication();
  const {
    formState: { isDirty },
  } = formMethod;

  const onDiscard = useCallback(() => {
    Router.push(getRouteURL(ROUTE.VIEW_SOURCE_DATASETS, atlasId));
  }, [atlasId]);

  return isAuthenticated ? (
    <TrackerForm>
      <FormManagement
        formDiscardProps={getFormDiscardProps(onDiscard)}
        formSaveProps={getFormSaveProps(formMethod)}
        isDirty={isDirty}
      />
      <Divider />
      <GeneralInfo formMethod={formMethod} />
      <Divider />
      <Identifiers formMethod={formMethod} />
      <Divider />
    </TrackerForm>
  ) : (
    <AuthenticationRequired divider={<Divider />}>
      <Link label={"Sign in"} url={ROUTE.LOGIN} /> to edit a source dataset.
    </AuthenticationRequired>
  );
};
