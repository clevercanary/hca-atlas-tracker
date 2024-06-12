import { HCAAtlasTrackerAtlas } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { NewAtlasData } from "../../../../views/AddNewAtlasView/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import {
  GENERAL_INFO_NEW_ATLAS_CONTROLLERS,
  INTEGRATION_LEAD_NEW_ATLAS_CONTROLLERS,
} from "../TrackerForm/components/Section/components/Atlas/common/constants";
import { GeneralInfo } from "../TrackerForm/components/Section/components/Atlas/components/GeneralInfo/generalInfo";
import { IntegrationLead } from "../TrackerForm/components/Section/components/Atlas/components/IntegrationLead/integrationLead";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { NoAccess } from "./components/NoAccess/noAccess";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface AddAtlasProps {
  formManager: FormManagerProps;
  formMethod: FormMethod<NewAtlasData, HCAAtlasTrackerAtlas>;
}

export const AddAtlas = ({
  formManager,
  formMethod,
}: AddAtlasProps): JSX.Element => {
  const {
    access: { canEdit, canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  if (!canEdit) return <NoAccess />;
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      <Divider />
      <GeneralInfo<NewAtlasData>
        controllerConfigs={GENERAL_INFO_NEW_ATLAS_CONTROLLERS}
        formManager={formManager}
        formMethod={formMethod}
      />
      <Divider />
      <IntegrationLead<NewAtlasData>
        controllerConfigs={INTEGRATION_LEAD_NEW_ATLAS_CONTROLLERS}
        formManager={formManager}
        formMethod={formMethod}
      />
    </TrackerForm>
  );
};
