import { HCAAtlasTrackerAtlas } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { AtlasEditData } from "../../../../views/EditAtlasView/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/Atlas/components/GeneralInfo/generalInfo";
import { IntegrationLead } from "../TrackerForm/components/Section/components/Atlas/components/IntegrationLead/integrationLead";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface EditAtlasProps {
  formManager: FormManagerProps;
  formMethod: FormMethod<AtlasEditData, HCAAtlasTrackerAtlas>;
}

export const EditAtlas = ({
  formManager,
  formMethod,
}: EditAtlasProps): JSX.Element => {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      <GeneralInfo formMethod={formMethod} />
      <Divider />
      <IntegrationLead formMethod={formMethod} />
    </TrackerForm>
  );
};
