import { HCAAtlasTrackerComponentAtlas } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { NewComponentAtlasData } from "../../../../views/AddNewComponentAtlasView/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GENERAL_INFO_NEW_COMPONENT_ATLAS_CONTROLLERS } from "../TrackerForm/components/Section/components/ComponentAtlas/common/constants";
import { GeneralInfo } from "../TrackerForm/components/Section/components/ComponentAtlas/components/GeneralInfo/generalInfo";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { NoAccess } from "./components/NoAccess/noAccess";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface AddComponentAtlasProps {
  formManager: FormManagerProps;
  formMethod: FormMethod<NewComponentAtlasData, HCAAtlasTrackerComponentAtlas>;
}

export const AddComponentAtlas = ({
  formManager,
  formMethod,
}: AddComponentAtlasProps): JSX.Element => {
  const {
    access: { canEdit, canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  if (!canEdit) return <NoAccess />;
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      <Divider />
      <GeneralInfo<NewComponentAtlasData>
        controllerConfigs={GENERAL_INFO_NEW_COMPONENT_ATLAS_CONTROLLERS}
        formManager={formManager}
        formMethod={formMethod}
      />
    </TrackerForm>
  );
};
